// Run after generated browser-fixtures.js. Intercepted production build; all API data mocked.
async (page) => {
  const checks = [];
  const assert = (value, label) => { if (!value) throw new Error(label); checks.push(label); };
  const origin = 'http://fsociety.test';
  const id = '507f1f77bcf86cd799439022';
  const guideId = '507f1f77bcf86cd799439099';
  const user = { _id: '507f1f77bcf86cd799439011', username: 'obsidian', role: 'user', avatar: '', score: 325, solvedChallenges: [], socialLinks: {}, isProfilePublic: true };
  const challenge = { _id: id, title: 'The Forgotten Endpoint', description: 'Trace an overlooked API route, investigate its permissions, and uncover five hidden flags.', category: 'web', difficulty: 'easy', points: 50, hints: [], files: [], attachments: [], totalFlags: 1, completedFlags: 0, solveCount: 5, isSolved: false, createdAt: '2026-10-01T00:00:00Z', updatedAt: '2026-10-27T00:00:00Z', status: 'approved', writeupCount: 1 };
  const guide = { _id: guideId, userId: { _id: 'guide-author', username: 'sheriff' }, challengeId: { _id: id, title: challenge.title, category: 'web' }, title: 'Finding the forgotten route', content: 'Follow the API requests, compare the access controls, and investigate the hidden route. A careful walkthrough of each step in the solution.', status: 'approved', createdAt: '2026-10-27T10:00:00Z' };
  const requests = [];
  let liveSocket;
  await page.routeWebSocket('**/socket.io/**', ws => {
    ws.send('0' + JSON.stringify({ sid: 'community-fixture', upgrades: [], pingInterval: 25000, pingTimeout: 20000, maxPayload: 1000000 }));
    ws.onMessage(message => {
      if (message === '40') { ws.send('40' + JSON.stringify({ sid: 'community-fixture' })); liveSocket = ws; }
    });
  });
  const ranks = ['azerian', 'kachy_ka_daku', 'abdullah', 'obsidian', 'cipher'].map((username, i) => ({ userId: `fixture-${i}`, username, avatar: '', score: 550 - i * 75, solveCount: 5, rank: i + 1 }));
  let approved = false;
  let feed = [{ id: 'first', username: 'sheriff', challengeId: id, challengeTitle: challenge.title, points: 50, timestamp: new Date(Date.now() - 60000).toISOString() }];
  await page.route('**/api/v1/**', async route => {
    const req = route.request(), url = new URL(req.url()), path = url.pathname;
    requests.push({ path, method: req.method() });
    const json = data => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ success: true, statusCode: 200, data }) });
    const library = { writeups: approved ? [guide] : [], pagination: { total: approved ? 1 : 0, page: 1, limit: 10, pages: 1 } };
    if (path.endsWith('/leaderboard')) return json(ranks);
    if (path.endsWith('/notifications/unread-count')) return json({ unreadCount: 0 });
    if (path.endsWith('/auth/me')) return json(user);
    if (path.endsWith('/users/me/profile')) return json({ ...user, solveHistory: [] });
    if (path.endsWith('/challenges/activity/recent')) return json(feed);
    if (path.endsWith('/writeups/user/me')) return json({ writeups: [{ ...guide, userId: { _id: user._id, username: user.username }, status: 'pending' }], pagination: { page: 1, pages: 1 } });
    if (path.endsWith('/writeups') || path.endsWith('/writeups/challenge/' + id)) return json(library);
    if (path.endsWith('/writeups/' + guideId)) return json(guide);
    if (path.endsWith('/challenges/submit')) {
      challenge.isSolved = true; challenge.completedFlags = 1; challenge.completedAt = '2026-10-27T10:00:00.000Z';
      return json({ correct: true, completed: true, points: 50, completedAt: challenge.completedAt });
    }
    if (path.endsWith('/challenges')) return json([challenge, { ...challenge, _id: '507f1f77bcf86cd799439023', title: 'Shadow Token', totalFlags: 5, completedFlags: 2, completedSequences: [1, 2], writeupCount: 0 }, { ...challenge, _id: '507f1f77bcf86cd799439024', title: 'YOU_CAN_DO_IT', category: 'crypto', writeupCount: 2 }]);
    if (path.endsWith('/challenges/' + id)) return json(challenge);
    if (path.endsWith('/admin/challenges/' + id + '/flags')) return json({ flags: [{ sequence: 1, value: 'fsociety{admin_visible}' }], totalFlags: 1, recoverable: true });
    if (path.endsWith('/admin/challenges/' + id)) return json(challenge);
    return route.fallback();
  });
  await page.evaluate(user => {
    localStorage.setItem('fsocietypk-auth', JSON.stringify({ state: { user, isAuthenticated: true }, version: 0 }));
    localStorage.setItem('fsociety-theme', 'light');
  }, user);
  const go = async path => { await page.goto(origin + path); await page.waitForLoadState('networkidle'); };
  await page.setViewportSize({ width: 1440, height: 900 });
  await go('/writeups');
  await page.getByRole('heading', { name: 'Community writeups', exact: true }).waitFor();
  await page.getByText('Approved community solutions will appear here').waitFor();
  approved = true;
  liveSocket.send('42' + JSON.stringify(['writeupsUpdate']));
  await page.getByRole('link', { name: '@sheriff', exact: true }).waitFor();
  assert(await page.getByRole('link', { name: '@sheriff', exact: true }).isVisible(), 'Community library shows approved guide author');
  await page.getByRole('button', { name: 'Read Full Writeup' }).click();
  await page.getByRole('heading', { name: guide.title }).waitFor();
  assert(await page.getByRole('link', { name: 'View challenge', exact: true }).getAttribute('href') === '/challenges/' + id, 'Public guide links back to the correct challenge');
  await go('/writeups?view=mine');
  await page.getByRole('heading', { name: 'My writeups', exact: true }).waitFor();
  assert(await page.getByText('Pending Approval', { exact: true }).isVisible(), 'Members can still inspect their pending submissions');
  await page.getByRole('tab', { name: 'Community writeups' }).click();
  await page.getByRole('link', { name: '@sheriff', exact: true }).waitFor();
  await go('/challenges');
  const cards = page.locator('.challenge-card');
  await cards.first().waitFor();
  assert(await cards.count() === 3, 'Challenge grid includes all categories');
  assert(await cards.first().getByRole('link', { name: '1 writeup available' }).isVisible(), 'Challenge cards expose approved writeup availability');
  assert(await cards.nth(1).getByText('No writeups yet').isVisible(), 'Zero writeups have a clear availability state');
  assert(await cards.nth(1).getByRole('progressbar').getAttribute('aria-valuenow') === '2', 'Multi-flag progress survives card redesign');
  assert(await cards.first().evaluate(el => getComputedStyle(el).backgroundColor === 'rgb(255, 255, 255)'), 'Challenge cards use the neutral workspace surface');
  for (const [width, height] of [[1440, 900], [768, 1024], [390, 844], [320, 568]]) {
    await page.setViewportSize({ width, height });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Challenge cards fit ${width}px`);
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({ path: '/home/sheriff/fsocietypk-web/.playwright-mcp/community-challenges-light.png', fullPage: true });
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.challenge-card')).backgroundColor === 'rgb(' + getComputedStyle(document.documentElement).getPropertyValue('--card').trim().split(/\s+/).join(', ') + ')');
  assert(await cards.first().evaluate(el => getComputedStyle(el).backgroundColor === 'rgb(' + getComputedStyle(document.documentElement).getPropertyValue('--card').trim().split(/\s+/).join(', ') + ')'), 'Challenge cards use the dark workspace surface');
  await page.screenshot({ path: '/home/sheriff/fsocietypk-web/.playwright-mcp/community-challenges-dark.png', fullPage: true });
  await page.getByRole('button', { name: 'Switch to light theme' }).click();
  await go('/dashboard');
  await page.getByRole('heading', { name: 'Recent solves', exact: true }).waitFor();
  await page.locator('.live-status').getByText('Live', { exact: true }).waitFor();
  assert(await page.locator('.solve-feed').innerText().then(text => text.includes('@sheriff solved ' + challenge.title)), 'Dashboard describes community solves with member and challenge names');
  assert(await page.locator('.solve-feed time').getAttribute('datetime') === feed[0].timestamp, 'Feed retains machine-readable solve timestamps');
  await page.screenshot({ path: '/home/sheriff/fsocietypk-web/.playwright-mcp/community-dashboard.png', fullPage: true });
  feed = [{ ...feed[0], id: 'live', username: 'cipher', timestamp: new Date().toISOString() }, ...feed];
  liveSocket.send('42' + JSON.stringify(['leaderboardUpdate']));
  await page.getByRole('link', { name: '@cipher', exact: true }).waitFor();
  assert(await page.locator('.solve-feed li').first().innerText().then(text => text.includes('@cipher')), 'WebSocket solve broadcast refreshes the live dashboard');
  feed = [{ ...feed[0], id: 'newest', username: 'new_solver', timestamp: new Date().toISOString() }, ...feed];
  await page.waitForTimeout(31000);
  await page.getByRole('link', { name: '@new_solver', exact: true }).waitFor();
  assert(await page.locator('.solve-feed li').first().innerText().then(text => text.includes('@new_solver')), 'Periodic fallback refresh displays the newest solve first');
  await go('/leaderboard');
  await page.locator('.podium-card').first().waitFor();
  assert(await page.locator('.podium-card').count() === 3, 'Hall of Fame has three animated podium places');
  assert(await page.locator('.fame-place-1').getByText('Leading the board').isVisible(), 'Hall of Fame highlights the leader');
  await page.waitForFunction(() => Number(getComputedStyle(document.querySelector('.fame-podium-slot')).opacity) > .99);
  await page.screenshot({ path: '/home/sheriff/fsocietypk-web/.playwright-mcp/community-hall-light.png', fullPage: true });
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await page.screenshot({ path: '/home/sheriff/fsocietypk-web/.playwright-mcp/community-hall-dark.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: '/home/sheriff/fsocietypk-web/.playwright-mcp/community-hall-mobile.png', fullPage: true });
  await page.getByRole('button', { name: 'Switch to light theme' }).click();
  await page.getByRole('tab', { name: 'This week' }).click();
  await page.getByLabel('Search members').fill('azerian');
  assert(await page.locator('tbody tr').count() === 1, 'Ranking search includes podium members');
  await page.getByLabel('Search members').fill('');
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Hall of Fame fits ${width}px`);
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  assert(await page.locator('.podium-card').first().evaluate(el => getComputedStyle(el, '::before').animationName === 'none'), 'Hall of Fame respects reduced motion');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await go('/challenges/' + id);
  await page.getByRole('link', { name: 'Writeups (1)' }).waitFor();
  assert(!await page.getByRole('button', { name: 'Share your solution' }).count(), 'Writeups are readable before solving; submitting a solution still requires a solve');
  await page.getByPlaceholder('fsociety{your_flag_here}').fill('fsociety{correct}');
  await page.getByRole('button', { name: 'SUBMIT', exact: true }).click();
  await page.getByRole('dialog', { name: 'Challenge successfully completed', exact: true }).getByRole('button', { name: 'View badge', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Challenge badge', exact: true });
  await dialog.waitFor();
  assert(await page.getByRole('dialog').count() === 1, 'Completing a challenge opens exactly one badge dialog');
  for (const [width, height] of [[1440, 900], [1366, 768], [390, 844], [320, 568]]) {
    await page.setViewportSize({ width, height });
    const box = await dialog.boundingBox();
    assert(box.x >= 0 && box.y >= 0 && box.x + box.width <= width && box.y + box.height <= height, `Badge dialog stays within ${width}x${height}`);
    assert(box.width <= 700, 'Badge uses a compact maximum width');
    assert(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth), `Badge has no horizontal scrolling at ${width}px`);
    assert(await dialog.getByRole('button', { name: 'Done' }).evaluate(el => { const rect = el.getBoundingClientRect(); return rect.bottom <= innerHeight && rect.top >= 0; }), 'Return control is always visible');
  }
  await page.screenshot({ path: '/home/sheriff/fsocietypk-web/.playwright-mcp/community-badge-mobile.png', fullPage: true });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({ path: '/home/sheriff/fsocietypk-web/.playwright-mcp/community-badge.png', fullPage: true });
  const downloadPromise = page.waitForEvent('download');
  await dialog.getByRole('button', { name: 'Download badge', exact: true }).click();
  assert(await (await downloadPromise).failure() === null, 'Compact preview still downloads the full badge SVG');
  await dialog.getByRole('button', { name: 'Done' }).click();
  await dialog.waitFor({ state: 'hidden' });
  assert(await page.getByRole('dialog').count() === 0, 'Closing the badge returns to the solved challenge without a follow-up modal');
  await page.getByRole('button', { name: 'View badge', exact: true }).click();
  await dialog.waitFor();
  await page.keyboard.press('Escape');
  await dialog.waitFor({ state: 'hidden' });
  assert(await page.getByRole('button', { name: 'View badge', exact: true }).evaluate(el => el === document.activeElement), 'Escape restores keyboard focus to the badge trigger');
  // Staff preview: secrets are loaded only by the explicit reveal control.
  user.role = 'admin';
  await page.evaluate(user => localStorage.setItem('fsocietypk-auth', JSON.stringify({ state: { user, isAuthenticated: true }, version: 0 })), user);
  await go('/admin/challenges/' + id);
  await page.getByRole('heading', { name: 'Review & edit challenge' }).waitFor();
  assert(!requests.some(req => req.path.endsWith('/flags')), 'Flag values are not prefetched into the browser');
  await page.getByRole('button', { name: 'Show flags' }).click();
  await page.getByText('fsociety{admin_visible}', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Hide flags' }).click();
  assert(!await page.getByText('fsociety{admin_visible}', { exact: true }).count(), 'Staff can reveal and hide the challenge flags');
  const fixture = await page.evaluate(async () => (await (await fetch('/__fixture')).json()).data);
  assert(!fixture.errors.length, 'No uncaught JavaScript errors in community workflows');
  return { mode: 'intercepted production build and mocked API', checks };
}
