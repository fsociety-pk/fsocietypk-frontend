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
    const headers = { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Credentials': 'true', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,Authorization' };
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers });
    const json = data => route.fulfill({ status: 200, headers, contentType: 'application/json', body: JSON.stringify({ success: true, statusCode: 200, data }) });
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
  check(await page.locator('.challenge-card-solved').getByText('Challenge solved', { exact: true }).isVisible(), 'Solved is explicit text');
  check(await card.getByText('In progress', { exact: true }).isVisible(), 'Partial progress is distinct from completion');
  check(await page.locator('.challenge-card').filter({ hasText: two.title }).getByText('Not started', { exact: true }).isVisible(), 'Unstarted tasks have a clear initial state');
  check(await page.locator('.challenge-card-solved').getByRole('link', { name: 'Review challenge', exact: true }).getAttribute('href') === '/challenges/' + single._id, 'Completed cards remain reviewable');
  check(await page.locator('.challenge-card-solved').getByRole('progressbar').getAttribute('aria-valuenow') === '1', 'Single-flag completion shows real flag progress');
  const colors = await page.locator('.challenge-card').evaluateAll(cards => cards.map(c => ({
    background: getComputedStyle(c).backgroundColor,
    accent: getComputedStyle(c.querySelector('.category-label')).color,
    title: getComputedStyle(c.querySelector('h2')).color,
    weight: Number(getComputedStyle(c.querySelector('h2')).fontWeight),
  })));
  check(colors.every(c => c.weight >= 750), 'Challenge titles are bold');
  check(new Set(colors.map(c => c.accent)).size > 1, 'Categories retain distinct label colors');
  check(colors[0].background !== await page.locator('body').evaluate(el => getComputedStyle(el).backgroundColor), 'Cards contrast with page');
  check(colors[0].background !== colors[2].background, 'Completion changes the whole card surface');
  for (const theme of ['light', 'dark']) {
    await page.evaluate(theme => { document.documentElement.dataset.theme = theme; document.documentElement.style.colorScheme = theme; localStorage.setItem('fsociety-theme', theme); }, theme);
    const contrast = await page.locator('.challenge-card').evaluateAll(cards => {
      const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1;
      const ctx = canvas.getContext('2d');
      const luminance = (color, backdrop = 'white') => { ctx.clearRect(0,0,1,1);ctx.fillStyle=backdrop;ctx.fillRect(0,0,1,1);ctx.fillStyle=color;ctx.fillRect(0,0,1,1);const rgb=[...ctx.getImageData(0,0,1,1).data].slice(0,3).map(c=>c/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722; };
      const ratio = (a,b,backdrop) => { const x=luminance(a),y=luminance(b,backdrop);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05); };
      return cards.map(card => {
        const background=getComputedStyle(card).backgroundColor;
        const state=card.querySelector('.challenge-card-status');
        return { title:ratio(getComputedStyle(card.querySelector('h2')).color, background), body:ratio(getComputedStyle(card.querySelector('p')).color, background), status:ratio(getComputedStyle(state).color, getComputedStyle(state).backgroundColor, background) };
      });
    });
    check(contrast.every(c=>c.title>=4.5 && c.body>=4.5 && c.status>=4.5), `${theme}: task, description and state text meet AA contrast`);
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${theme}: all three card states fit ${width}px`);
      check(await page.locator('.challenge-card-action').evaluateAll(links=>links.every(link=>link.getBoundingClientRect().height>=44)), `${theme}: ${width}px actions retain touch targets`);
    }
    await page.screenshot({ path: `/tmp/challenge-library-${theme}.png`, fullPage: true });
    await page.setViewportSize({width:390,height:844});
    await page.screenshot({ path: `/tmp/challenge-library-phone-${theme}.png`, fullPage: true });
  }
  await page.evaluate(() => { document.documentElement.dataset.theme = 'light'; localStorage.setItem('fsociety-theme','light'); });
  await page.setViewportSize({width:1440,height:1000});
  await page.keyboard.press('Tab');
  await card.getByRole('link', { name: five.title, exact: true }).focus();
  check(await card.getByRole('link', { name: five.title, exact: true }).evaluate(el=>getComputedStyle(el).outlineStyle !== 'none'), 'Challenge title keeps a visible keyboard focus indicator');
  await page.emulateMedia({reducedMotion:'reduce'});
  await card.hover();
  check(await card.evaluate(el=>getComputedStyle(el).transform === 'none'), 'Reduced motion keeps cards still');
  await page.mouse.move(5,5);
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
  await page.getByRole('button', { name: 'Back to challenges', exact: true }).click();
  await page.locator('.challenge-card').filter({ hasText: five.title }).getByText('Challenge solved', { exact: true }).waitFor();
  check(await page.locator('.challenge-card-solved').count() === 2, 'Newly completed challenge appears solved');
  check(await page.locator('.challenge-card').filter({ hasText: five.title }).getByText('Challenge solved', { exact: true }).isVisible(), 'Submitting the last flag changes the library card into its completed treatment');
  check(await page.locator('.challenge-card').filter({ hasText: five.title }).getByRole('progressbar').getAttribute('aria-valuenow') === '5', 'Completed card shows full progress');
  await page.reload(); await page.locator('.challenge-card-solved').first().waitFor();
  check(await page.locator('.challenge-card').filter({hasText:five.title}).getByText('Challenge solved',{exact:true}).isVisible(), 'The new solved card treatment survives a refresh');
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
