// Run after prepared browser-fixtures.js. All progress and accounts are fixtures.
async page => {
  const checks = [], errors = [];
  const check = (value, name) => { if (!value) throw Error(name); checks.push(name); };
  page.on('pageerror', error => errors.push(error.message));
  const categories = ['web', 'crypto', 'pwn', 'rev', 'forensics', 'osint', 'stego', 'network', 'mobile', 'misc'];
  const member = '507f1f77bcf86cd799439011', earnedAt = '2026-10-01T12:00:00.000Z';
  const make = (category, index) => ({ id: `${member}:${(100 + index).toString(16).padStart(24, '0')}`, challengeId: (100 + index).toString(16).padStart(24, '0'), title: `${category === 'web' ? 'Borrowed Badge' : category.toUpperCase() + ' challenge'}`, category, difficulty: index % 2 ? 'medium' : 'hard', points: 200, earnedAt });
  let awards = categories.map(make), isPublic = true, empty = false, legacy = false;
  const unfinished = { _id: '507f1f77bcf86cd799439022', title: 'The Final Cipher', category: 'crypto', difficulty: 'hard', points: 200, slug: 'final-cipher', description: 'Complete both flags to earn the challenge badge.', files: [], attachments: [], hints: [], totalFlags: 2, completedFlags: 0, completedSequences: [], isSolved: false, completedAt: null };
  const profile = () => ({ _id: member, username: 'karlos', role: 'user', score: awards.length * 200, rank: 7, isProfilePublic: isPublic, socialLinks: {}, createdAt: '2026-01-01T00:00:00Z', avatar: '',
    solvedChallenges: empty ? [] : awards.map(item => item.challengeId),
    ...(!legacy ? { earnedBadges: empty ? [] : awards } : {}),
    solveHistory: empty ? [] : awards.slice(0, 20).map(item => ({ _id: item.challengeId, challengeId: { _id: item.challengeId, title: item.title, category: item.category, difficulty: item.difficulty }, isCorrect: true, pointsAwarded: item.points, timestamp: item.earnedAt })),
    proficiencyIndex: [],
  });
  await page.route('**/api/**', async route => {
    const request = route.request(), path = new URL(request.url()).pathname;
    const json = (data, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify({ success: status < 400, data, message: 'Badge fixture' }) });
    if (path.endsWith('/auth/me')) return json(profile());
    if (path.endsWith('/users/me/profile')) {
      // Real profile updates return account fields without computed progress.
      if (request.method() === 'PUT') return json({ _id: member, username: 'karlos', bio: request.postDataJSON().bio, isProfilePublic: isPublic });
      return json(profile());
    }
    if (/\/users\/[^/]+\/profile$/.test(path)) return json(isPublic ? profile() : null, isPublic ? 200 : 403);
    if (path.endsWith('/notifications/unread-count')) return json({ unreadCount: 0 });
    if (path.endsWith('/challenges/submit')) {
      const next = unfinished.completedFlags + 1;
      if (request.postDataJSON().flag !== `fsociety{step_${next}}`) return json({ correct: false, nextSequence: next });
      unfinished.completedFlags++;
      unfinished.completedSequences.push(next);
      unfinished.isSolved = unfinished.completedFlags === 2;
      if (unfinished.isSolved) {
        unfinished.completedAt = '2026-10-30T12:00:00.000Z';
        awards = [{ ...make('crypto', 60), challengeId: unfinished._id, id: `${member}:${unfinished._id}`, title: unfinished.title, earnedAt: unfinished.completedAt }, ...awards];
      }
      return json({ correct: true, partial: !unfinished.isSolved, completed: unfinished.isSolved, points: unfinished.isSolved ? 200 : 0, nextSequence: next + 1, completedAt: unfinished.completedAt });
    }
    if (path.endsWith(`/challenges/${unfinished._id}`)) return json(unfinished);
    return json([]);
  });
  const go = async path => { await page.goto('http://fsociety.test' + path); await page.waitForLoadState('networkidle'); };
  const badgeCards = page.locator('.challenge-badge-card');
  const dialog = page.getByRole('dialog', { name: 'Challenge badge', exact: true });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.evaluate(() => localStorage.setItem('fsociety-theme', 'light'));
  await go('/profile?tab=badges');
  await badgeCards.first().waitFor();
  check(await page.getByRole('tab', { name: 'Badges', exact: true }).getAttribute('aria-selected') === 'true', 'Profile deep link opens the Badges tab');
  check(await page.getByRole('tab', { name: 'Certificates', exact: true }).count() === 0, 'Profile certificates are replaced by earned badges');
  check(await badgeCards.count() === 10, 'Each completed challenge has one earned badge');
  const assets = await badgeCards.locator('img').evaluateAll(images => images.map(img => ({ src: img.getAttribute('src'), loaded: img.complete && img.naturalWidth === 240 })));
  check(assets.every(item => item.loaded) && new Set(assets.map(item => item.src)).size === 10, 'All ten exact SVG category emblems load independently');
  check((await badgeCards.locator('.badge-owner-plate text').allTextContents()).every(name => name === '@karlos'), 'Every profile emblem includes its owner username');
  const shine = badgeCards.first().locator('.challenge-badge-shine');
  check(await shine.evaluate(el => getComputedStyle(el).animationIterationCount === 'infinite'), 'Profile emblems repeat their metallic shine continuously');
  const beforeShine = await shine.evaluate(el => getComputedStyle(el).transform);
  await page.waitForTimeout(160);
  check(beforeShine !== await shine.evaluate(el => getComputedStyle(el).transform), 'The profile shine advances across the emblem');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  check(await shine.evaluate(el => getComputedStyle(el).animationName === 'none' && getComputedStyle(el).display === 'none'), 'Reduced motion disables the repeating profile shine');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.screenshot({ path: '/tmp/challenge-badges-profile-desktop.png', fullPage: true });
  await page.getByLabel('Filter badges by category').selectOption('crypto');
  check(await badgeCards.count() === 1 && await badgeCards.first().getAttribute('data-badge-category') === 'crypto', 'Earned badges filter by category');
  await page.getByLabel('Filter badges by category').selectOption('all');
  await page.getByLabel('Search earned badges').fill('Borrowed');
  check(await badgeCards.count() === 1, 'Badge collection searches by the actual challenge name');
  await page.getByLabel('Search earned badges').fill('');
  await page.getByRole('button', { name: 'View Borrowed Badge badge', exact: true }).click();
  await dialog.waitFor();
  check(await dialog.locator('.badge-owner-plate text').textContent() === '@karlos', 'Opened badge artwork retains its owner username');
  check(await dialog.getByText(/^0?1 Oct 2026$/).count() === 1 && await dialog.getByText('Earned by @karlos', { exact: true }).count() === 1, 'Details show the actual owner and recorded completion date');
  check(await dialog.getByText('200 pts', { exact: true }).count() === 1, 'Details preserve earned points');
  const downloadEvent = page.waitForEvent('download');
  await dialog.getByRole('button', { name: 'Download badge', exact: true }).click();
  const download = await downloadEvent;
  await download.saveAs('/tmp/fsociety-earned-badge.svg');
  check(download.suggestedFilename().endsWith('-badge.svg') && await download.failure() === null, 'Badge exports as a crisp standalone SVG');
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async value => { window.__badgeLink = value; } } }));
  await dialog.getByRole('button', { name: 'Copy badge link', exact: true }).click();
  check(await page.evaluate(id => window.__badgeLink.includes('/profile/karlos?badge=' + id), awards[0].challengeId), 'Public badge sharing links to its owner and exact challenge');
  for (const [width, height] of [[320,568], [390,844], [768,900], [1600,1000]]) {
    await page.setViewportSize({ width, height });
    const box = await dialog.boundingBox();
    check(box.x >= 0 && box.y >= 0 && box.x + box.width <= width && box.y + box.height <= height, `Badge details fit ${width}×${height}`);
    check(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth), `Badge details have no horizontal scroll at ${width}px`);
  }
  await page.keyboard.press('Escape');
  check(await page.getByRole('button', { name: 'View Borrowed Badge badge', exact: true }).evaluate(el => el === document.activeElement), 'Escape closes badge details and restores the trigger focus');
  for (const width of [320,390,768,1024,1600]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}px badge collection has no horizontal overflow`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: '/tmp/challenge-badges-profile-phone.png', fullPage: true });
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.screenshot({ path: '/tmp/challenge-badges-profile-dark.png', fullPage: true });
  await page.getByRole('button', { name: 'Switch to light theme' }).click();
  await go('/profile/karlos?badge=' + awards[0].challengeId);
  await dialog.waitFor();
  check(await dialog.getByText('Borrowed Badge', { exact: true }).count() === 1, 'Shared public badge link opens its earned badge');
  await page.keyboard.press('Escape');
  check((await badgeCards.locator('.badge-owner-plate text').allTextContents()).every(name => name === '@karlos') && await badgeCards.locator('.challenge-badge-shine').count() === 10, 'Public profile badges use their owner and include the repeating shine');
  await go('/profile?tab=edit');
  await page.getByLabel('Bio', { exact: true }).fill('Learning through practice.');
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await page.getByText('Your profile has been updated.', { exact: true }).waitFor();
  await page.getByRole('tab', { name: 'Badges', exact: true }).click();
  check(await badgeCards.count() === 10, 'Editing account fields preserves the existing computed badge collection');
  await go('/challenges/' + unfinished._id);
  check(await page.getByRole('button', { name: 'View badge', exact: true }).count() === 0, 'Unfinished challenge cannot display an earned badge');
  let inputs = page.locator('input[placeholder="fsociety{your_flag_here}"]');
  await inputs.first().fill('fsociety{step_1}');
  await inputs.first().locator('..').getByRole('button').click();
  await page.locator('[role="progressbar"][aria-valuenow="1"]').waitFor();
  check(await page.getByRole('dialog').count() === 0, 'Partial flag does not open a celebration or award a badge');
  await inputs.nth(1).fill('fsociety{step_2}');
  await inputs.nth(1).locator('..').getByRole('button').click();
  const celebration = page.getByRole('dialog', { name: 'All flags captured!', exact: true });
  await celebration.waitFor();
  check(await page.locator('.completion-confetti > span').count() === 36, 'Full completion starts a finite celebration burst');
  await page.locator('.challenge-completion-dialog.phase-points').waitFor();
  await page.waitForFunction(() => { const value = Number(document.querySelector('.completion-points > span')?.textContent.replace(/[^0-9]/g,'')); return value > 0 && value <= 200; });
  check(await page.getByRole('dialog').count() === 1, 'Points animate inside the same completion dialog');
  const completed = page.getByRole('dialog', { name: 'Challenge successfully completed', exact: true });
  await completed.waitFor();
  check(await completed.getByText('Your badge has been added to your profile.', { exact: true }).count() === 1 && await completed.getByText('+200 points earned', { exact: true }).count() === 1, 'Final message confirms completion, actual points and saved profile badge');
  await page.screenshot({ path: '/tmp/challenge-completion-celebration.png' });
  await completed.getByRole('button', { name: 'View badge', exact: true }).click();
  await dialog.waitFor();
  check(await page.getByRole('dialog').count() === 1 && await dialog.getByText(unfinished.title, { exact: true }).count() === 1, 'Badge details replace the celebration without overlapping dialogs');
  await dialog.getByRole('link', { name: 'View my badge collection', exact: true }).click();
  await badgeCards.first().waitFor();
  check(await badgeCards.count() === 11 && await page.getByRole('button', { name: 'View The Final Cipher badge', exact: true }).count() === 1, 'Completed challenge appears exactly once in the profile badge collection');
  await page.reload();
  await badgeCards.first().waitFor();
  check(await badgeCards.count() === 11, 'Earned badges persist after reload from server completion data');
  await go('/challenges/' + unfinished._id);
  check(await page.getByRole('dialog').count() === 0 && await page.getByRole('button', { name: 'View badge', exact: true }).count() === 1, 'Revisiting a completed challenge does not replay celebration');
  check(await page.getByRole('button', { name: /certificate/i }).count() === 0, 'Completed challenge has no certificate controls');
  isPublic = false;
  await go('/profile?tab=badges');
  await page.getByRole('button', { name: 'View Borrowed Badge badge', exact: true }).click();
  await dialog.waitFor();
  check(await dialog.getByRole('button', { name: 'Copy badge link', exact: true }).count() === 0, 'Private profile badges offer no public-share link');
  await page.keyboard.press('Escape');
  await go('/profile/karlos');
  await page.getByText('This profile is private', { exact: true }).waitFor();
  check(await badgeCards.count() === 0, 'Private public-profile endpoint does not expose earned badges');
  isPublic = true; empty = true;
  await go('/profile?tab=badges');
  await page.getByText('Your first badge is waiting.', { exact: true }).waitFor();
  check(await badgeCards.count() === 0 && await page.getByRole('link', { name: 'Explore challenges', exact: true }).count() === 1, 'Empty badge collection offers an honest first-solve action');
  empty = false;
  awards = Array.from({ length: 27 }, (_, index) => ({ ...make(categories[index % 10], index + 100), title: `Historical challenge ${index + 1}` }));
  await go('/profile?tab=badges');
  await badgeCards.first().waitFor();
  check(await badgeCards.count() === 24, 'Large badge collections initially render a manageable page');
  await page.getByRole('button', { name: 'Show more badges (3)', exact: true }).click();
  check(await badgeCards.count() === 27, 'Historical badges beyond the recent-history window remain available');
  await page.getByLabel('Search earned badges').fill('Historical challenge 27');
  check(await badgeCards.count() === 1, 'Search covers the full earned collection');
  legacy = true;
  await go('/profile?tab=badges');
  await badgeCards.first().waitFor();
  check(await badgeCards.count() === 20, 'Deployment compatibility derives badges from verified server history');
  legacy = false;
  Object.assign(unfinished, { _id: '507f1f77bcf86cd799439032', completedFlags: 1, completedSequences: [1], isSolved: false, completedAt: null });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 320, height: 568 });
  await go('/challenges/' + unfinished._id);
  inputs = page.locator('input[placeholder="fsociety{your_flag_here}"]');
  await inputs.nth(1).fill('fsociety{step_2}');
  await inputs.nth(1).locator('..').getByRole('button').click();
  await completed.waitFor();
  check(await page.locator('.completion-confetti').count() === 0 && await page.locator('.completion-points').count() === 0, 'Reduced motion skips confetti and counting and shows the final message immediately');
  const small = await completed.boundingBox();
  check(small.x >= 0 && small.y >= 0 && small.x + small.width <= 320 && small.y + small.height <= 568, 'Completion feedback fits a small phone');
  await page.screenshot({ path: '/tmp/challenge-completion-phone.png' });
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => document.activeElement === document.querySelector('.challenge-earned-badge button'));
  check(await page.getByRole('button', { name: 'View badge', exact: true }).evaluate(el => el === document.activeElement), 'Closing completion restores focus to the earned badge action');
  Object.assign(unfinished, { _id: '507f1f77bcf86cd799439042', completedFlags: 1, completedSequences: [1], isSolved: false, completedAt: null });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await go('/challenges/' + unfinished._id);
  inputs = page.locator('input[placeholder="fsociety{your_flag_here}"]');
  await inputs.nth(1).fill('fsociety{step_2}');
  await inputs.nth(1).locator('..').getByRole('button').click();
  await celebration.waitFor();
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1900);
  check(await page.getByRole('dialog').count() === 0, 'Dismissing celebration cancels its timers without a surprise follow-up dialog');
  check(errors.length === 0, 'No browser runtime errors');
  return { passed: checks.length, checks };
}
