// Run after prepare-browser.cjs and the generated browser-fixtures.js.
// Built frontend, mock API. No production requests or records.
async (page) => {
  const origin = 'http://fsociety.test';
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const base = {
    slug: 'fixture', description: 'Investigate the evidence, uncover each flag, and complete the challenge.',
    hints: [], files: [], attachments: [], isActive: true, status: 'approved',
    points: 50, createdAt: '2026-01-01T00:00:00Z', difficulty: 'easy',
  };
  const five = { ...base, _id: '507f1f77bcf86cd799439022', title: 'The Forgotten Endpoint', category: 'web', totalFlags: 5, completedFlags: 2, completedSequences: [1, 2], isSolved: false, solveCount: 5 };
  const two = { ...base, _id: '507f1f77bcf86cd799439023', title: 'Log Hunter', category: 'forensics', totalFlags: 2, completedFlags: 0, completedSequences: [], isSolved: false, solveCount: 3 };
  const single = { ...base, _id: '507f1f77bcf86cd799439024', title: 'YOU_CAN_DO_IT', category: 'crypto', totalFlags: 1, completedFlags: 1, completedSequences: [], isSolved: true, solveCount: 5, completedAt: '2026-10-01T12:00:00Z' };
  const all = [five, two, single];
  const profile = () => ({
    _id: '507f1f77bcf86cd799439011', username: 'obsidian', role: 'user', avatar: '',
    country: 'Pakistan', socialLinks: {}, isProfilePublic: true, rank: 4, createdAt: base.createdAt,
    score: all.filter(c => c.isSolved).length * 50,
    solvedChallenges: all.filter(c => c.isSolved),
    solveHistory: all.filter(c => c.isSolved).map(c => ({ _id: c._id, challengeId: c, isCorrect: true, pointsAwarded: c.points, timestamp: c.completedAt })),
    challengeProgress: all.filter(c => !c.isSolved && c.completedFlags > 0).map(c => ({ challengeId: c, completedFlags: c.completedFlags, totalFlags: c.totalFlags })),
    proficiencyIndex: all.map(c => ({ category: c.category, solved: Number(c.isSolved), total: 1 })),
  });
  await page.route('**/api/**', async route => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const json = data => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, statusCode: 200, data }) });
    if (path.endsWith('/auth/me') || path.endsWith('/users/me/profile') || /\/users\/[^/]+\/profile$/.test(path)) return json(profile());
    if (path.endsWith('/notifications/unread-count')) return json({ unreadCount: 0 });
    if (path.endsWith('/challenges/submit')) {
      const body = request.postDataJSON();
      const challenge = all.find(c => c._id === body.challengeId);
      const next = challenge.completedFlags + 1;
      if (body.flag !== `fsociety{step_${next}}`) return json({ correct: false, nextSequence: next });
      challenge.completedFlags++;
      challenge.completedSequences.push(next);
      challenge.isSolved = challenge.completedFlags === challenge.totalFlags;
      if (challenge.isSolved) { challenge.completedAt = '2026-10-25T12:00:00Z'; challenge.solveCount++; }
      return json({ correct: true, partial: !challenge.isSolved, completed: challenge.isSolved, points: challenge.isSolved ? 50 : 0, nextSequence: next + 1, completedAt: challenge.completedAt });
    }
    if (path.endsWith('/solvers')) return json([]);
    if (path.endsWith('/challenges')) return json(all);
    const challenge = all.find(c => path.endsWith('/challenges/' + c._id));
    if (challenge) return json(challenge);
    return json([]);
  });
  let checks = 0;
  const check = (condition, message) => { if (!condition) throw new Error(message); checks++; };
  const go = async path => { await page.goto(origin + path); await page.waitForLoadState('networkidle'); };
  await page.evaluate(user => {
    localStorage.setItem('fsocietypk-auth', JSON.stringify({ state: { user, isAuthenticated: true }, version: 0 }));
    localStorage.setItem('fsociety-theme', 'light');
  }, profile());
  await page.setViewportSize({ width: 1440, height: 1000 });
  await go('/challenges');
  await page.locator('.challenge-card').first().waitFor();
  check(await page.locator('.challenge-card').count() === 3, 'One card per challenge');
  check(await page.locator('.challenge-card h2 svg').count() === 0, 'Challenge titles stay free of decorative icons');
  check(await page.locator('.challenge-card-solved').count() === 1, 'Only complete challenges have solved styling');
  const card = page.locator('.challenge-card').filter({ hasText: five.title });
  check(await card.getByRole('progressbar').getAttribute('aria-valuenow') === '2', 'Card shows 2 of 5 flags');
  check(await card.getByText('Continue challenge').isVisible(), 'Partial card has continue action');
  check(await page.locator('.challenge-card-solved').getByText('Solved', { exact: true }).isVisible(), 'Solved is explicit text');
  const colors = await page.locator('.challenge-card').evaluateAll(cards => cards.map(c => ({
    background: getComputedStyle(c).backgroundColor,
    accent: getComputedStyle(c.querySelector('.category-label')).color,
    title: getComputedStyle(c.querySelector('h2')).color,
    weight: Number(getComputedStyle(c.querySelector('h2')).fontWeight),
  })));
  check(colors.every(c => c.weight >= 750), 'Challenge titles are bold');
  check(new Set(colors.map(c => c.accent)).size > 1, 'Categories retain distinct label colors');
  check(colors[0].background !== await page.locator('body').evaluate(el => getComputedStyle(el).backgroundColor), 'Cards contrast with page');
  await page.screenshot({ path: '.playwright-mcp/challenge-cards-light.png', fullPage: true });
  await page.getByRole('combobox', { name: 'Filter by category' }).selectOption('crypto');
  check(await page.locator('.challenge-card').count() === 1, 'Category filter still works');
  await page.getByRole('combobox', { name: 'Filter by category' }).selectOption('all');
  await page.getByRole('textbox', { name: 'Search challenges' }).fill('Forgotten');
  check(await page.locator('.challenge-card').count() === 1, 'Title search still works');
  await page.getByRole('textbox', { name: 'Search challenges' }).fill('');
  // Obsolete local storage must never override server progress.
  await page.evaluate(({ id }) => localStorage.setItem(`flag-progress:v3:507f1f77bcf86cd799439011:${id}`, '[1,2,3,4,5]'), { id: five._id });
  await card.getByRole('link', { name: five.title, exact: true }).click();
  await page.getByRole('heading', { name: five.title, exact: true }).waitFor();
  check(await page.getByRole('progressbar', { name: 'Flags solved' }).getAttribute('aria-valuenow') === '2', 'Server overrides stale local progress');
  check(await page.locator('input[placeholder="fsociety{your_flag_here}"]').count() === 5, 'All five flag stages render');
  const inputs = page.locator('input[placeholder="fsociety{your_flag_here}"]');
  check(await inputs.nth(2).isEnabled() && await inputs.nth(3).isDisabled(), 'Next stage opens and later stages stay locked');
  check(await page.getByRole('button', { name: 'View badge', exact: true }).count() === 0, 'Partial challenge has no badge');
  await page.reload();
  await page.waitForLoadState('networkidle');
  check(await page.getByRole('progressbar', { name: 'Flags solved' }).getAttribute('aria-valuenow') === '2', 'Progress survives refresh');
  await inputs.nth(2).fill('wrong');
  await inputs.nth(2).locator('..').getByRole('button').click();
  await page.getByRole('status').filter({ hasText: 'Flag 3 is incorrect. Lol!' }).waitFor();
  check(await page.getByRole('progressbar', { name: 'Flags solved' }).getAttribute('aria-valuenow') === '2', 'Wrong flag leaves progress unchanged');
  await inputs.nth(2).locator('..').getByRole('button').click();
  await page.getByRole('status').filter({ hasText: 'Flag 3 is incorrect. The flag is in another castle.' }).waitFor();
  check(await inputs.nth(2).inputValue() === 'wrong', 'Playful retries rotate messages and preserve the entered flag');
  for (let step = 3; step <= 5; step++) {
    await inputs.nth(step - 1).fill(`fsociety{step_${step}}`);
    await inputs.nth(step - 1).locator('..').getByRole('button').click();
    await page.locator(`[role="progressbar"][aria-valuenow="${step}"]`).waitFor();
    check(true, `Flag ${step} advances progress`);
  }
  await page.getByRole('dialog').waitFor();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'View badge', exact: true }).waitFor();
  check(await page.getByText('Challenge completed', { exact: true }).isVisible(), 'Completion unlocks solved state');
  await go('/challenges');
  check(await page.locator('.challenge-card-solved').count() === 2, 'Newly completed challenge appears solved');
  check(await page.locator('.challenge-card').filter({ hasText: five.title }).getByRole('progressbar').getAttribute('aria-valuenow') === '5', 'Completed card shows full progress');
  await go('/profile');
  check(await page.locator('.stats-strip').getByText('2', { exact: true }).isVisible(), 'Profile counts two challenges');
  check(await page.locator('tr').filter({ hasText: five.title }).count() === 1, 'Multi-flag solve appears once in history');
  await go('/challenges/' + five._id);
  check(await page.getByText('Challenge completed', { exact: true }).isVisible(), 'Completed state survives a fresh load');
  for (const width of [320, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await go('/challenges');
    check(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `No card overflow at ${width}px`);
    if (width === 320) await page.screenshot({ path: '.playwright-mcp/challenge-cards-mobile.png', fullPage: true });
  }
  await page.evaluate(() => { document.documentElement.dataset.theme = 'dark'; document.documentElement.style.colorScheme = 'dark'; });
  await page.screenshot({ path: '.playwright-mcp/challenge-cards-dark.png', fullPage: true });
  check(errors.length === 0, 'No uncaught browser errors: ' + errors.join('; '));
  return { checks, mode: 'production frontend with mock API', screenshots: ['challenge-cards-light.png', 'challenge-cards-mobile.png', 'challenge-cards-dark.png'] };
}
