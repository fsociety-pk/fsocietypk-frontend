// Production build with mocked HTTP/WebSocket data; no accounts or real solves.
async page => {
  const checks = [], errors = [];
  const check = (condition, label) => { if (!condition) throw Error(label); checks.push(label); };
  page.on('pageerror', error => errors.push(error.message));
  const member = '507f1f77bcf86cd799439011', challenge = '507f1f77bcf86cd799439022', pending = '507f1f77bcf86cd799439023';
  const now = new Date().toISOString();
  let socket, failProfile = false, failFeed = false, hold = false;
  const releases = [];
  let profile = {
    _id: member, username: 'karlos', role: 'user', score: 200, rank: 7, solvedChallenges: [challenge],
    solveHistory: [{ _id: 'history-1', challengeId: { _id: challenge, title: 'The Forgotten Endpoint', category: 'web' }, isCorrect: true, pointsAwarded: 200, timestamp: now }],
    challengeProgress: [{ challengeId: { _id: pending, title: 'Shadow Token' }, completedFlags: 2, totalFlags: 5 }, { challengeId: { _id: 'complete', title: 'Already finished' }, completedFlags: 5, totalFlags: 5 }],
  };
  let feed = Array.from({ length: 12 }, (_, i) => ({ id: `solve-${i}`, username: i ? `solver_${i}` : 'sheriff', challengeId: challenge, challengeTitle: i ? `Challenge ${i}` : 'The Forgotten Endpoint', points: 200, timestamp: new Date(Date.now() - i * 60000).toISOString() }));
  await page.routeWebSocket('**/socket.io/**', ws => {
    ws.send('0' + JSON.stringify({ sid: 'overview-fixture', upgrades: [], pingInterval: 300000, pingTimeout: 20000, maxPayload: 1000000 }));
    ws.onMessage(message => { if (message === '40') { ws.send('40' + JSON.stringify({ sid: 'overview-fixture' })); socket = ws; } });
  });
  await page.route('**/api/**', async route => {
    const path = new URL(route.request().url()).pathname;
    const json = (data, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify({ success: status < 400, data, message: status >= 400 ? 'Fixture unavailable' : 'OK' }) });
    if (path.endsWith('/auth/me')) return json({ ...profile, username: 'karlos' });
    if (path.endsWith('/users/me/profile')) {
      if (hold) await new Promise(resolve => { releases.push(resolve); });
      return json(profile, failProfile ? 503 : 200);
    }
    if (path.endsWith('/challenges/activity/recent')) {
      if (hold) await new Promise(resolve => { releases.push(resolve); });
      return json(feed, failFeed ? 503 : 200);
    }
    if (path.endsWith('/notifications/unread-count')) return json({ unreadCount: 0 });
    return route.fallback();
  });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.evaluate(() => localStorage.setItem('fsociety-theme', 'light'));
  const go = async () => {
    await page.goto('http://fsociety.test/dashboard');
    await page.getByRole('heading', { name: 'Overview', exact: true }).waitFor();
  };
  await go();
  await page.waitForFunction(() => document.querySelectorAll('.overview-summary dd')[1]?.textContent === '200pts');
  await page.locator('.solve-feed li').first().waitFor();
  check(await page.locator('.dashboard-welcome,.overview-page > .live-solves').count() === 0, 'Large welcome banner and full-width activity section are removed');
  check(await page.locator('.overview-summary dl > div').count() === 3, 'Solved challenges, points and rank share one concise summary');
  check(await page.locator('.overview-summary dd').allTextContents().then(values => values[0] === '1' && values[1] === '200pts' && values[2] === '#7'), 'Progress summary renders the actual member statistics');
  check(await page.getByRole('link', { name: /Shadow Token.*2 of 5 flags captured/ }).getAttribute('href') === `/challenges/${pending}`, 'Unfinished challenge links resume the actual challenge');
  check(await page.getByText('Already finished', { exact: true }).count() === 0, 'Completed challenges are not offered as unfinished work');
  check(await page.locator('.overview-history').getByRole('link', { name: 'The Forgotten Endpoint', exact: true }).getAttribute('href') === `/challenges/${challenge}`, 'Personal solve history links to the challenge');
  check(await page.getByRole('progressbar', { name: 'Progress to level 2' }).getAttribute('value') === '200', 'Milestone progress uses earned points');
  check(await page.getByText('800 points', { exact: true }).count() === 1, 'Next milestone has a clear points target');
  const layout = await page.evaluate(() => {
    const feed = document.querySelector('.live-solves').getBoundingClientRect();
    const milestone = document.querySelector('.overview-level').getBoundingClientRect();
    const personal = document.querySelector('.overview-main').getBoundingClientRect();
    const list = document.querySelector('.solve-feed');
    return { feedRight: feed.left >= personal.right, belowMilestone: feed.top >= milestone.bottom, feedWidth: feed.width, feedHeight: feed.height, listHeight: list.clientHeight, listScroll: list.scrollHeight };
  });
  check(layout.feedRight && layout.belowMilestone, 'Recent solves occupies the lower right column below level progress');
  check(layout.feedWidth <= 340 && layout.feedHeight <= 420 && layout.listHeight <= 296 && layout.listScroll > layout.listHeight, 'Twelve community solves stay inside a compact scrolling box');
  check(await page.locator('.solve-feed').innerText().then(value => value.includes('@sheriff solved The Forgotten Endpoint')), 'Community feed clearly states who solved what');
  check(await page.locator('.solve-feed time').first().getAttribute('datetime') === feed[0].timestamp, 'Recent solves retain actual completion timestamps');
  await page.locator('.solve-feed').focus();
  await page.keyboard.press('End');
  await page.waitForFunction(() => document.querySelector('.solve-feed').scrollTop > 0, undefined, { timeout: 2000 });
  check(await page.locator('.solve-feed').evaluate(el => el.scrollTop > 0), 'Activity box scrolls with the keyboard');
  await page.locator('.solve-feed').evaluate(el => { el.scrollTo({ top: 0, behavior: 'instant' }); el.blur(); });
  feed = [{ ...feed[0], id: 'new-solve', username: 'new_solver', challengeTitle: 'Newly captured flag', timestamp: now }, ...feed].slice(0, 12);
  socket.send('42' + JSON.stringify(['leaderboardUpdate']));
  await page.waitForFunction(() => document.querySelector('.solve-feed li')?.textContent.includes('@new_solver'));
  check(await page.locator('.live-solves').evaluate(el => el.getBoundingClientRect().height <= 420), 'Live arrivals update the feed without expanding its box');
  await page.locator('.solve-feed').evaluate(el => { el.scrollTo({ top: 0, behavior: 'instant' }); el.blur(); });
  for (const width of [1600, 1440, 1280, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: width < 700 ? 844 : 900 });
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}px overview has no horizontal overflow`);
    check(await page.locator('.solve-feed').evaluate(el => el.clientHeight <= 296), `${width}px recent solves remains bounded`);
  }
  await page.reload();
  await page.locator('.solve-feed li').first().waitFor();
  await page.setViewportSize({ width: 1600, height: 682 });
  await page.screenshot({ path: '/tmp/overview-redesign-desktop.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: '/tmp/overview-redesign-phone.png', fullPage: true });
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.screenshot({ path: '/tmp/overview-redesign-dark.png' });
  check(await page.locator('.overview-panel').first().evaluate(el => getComputedStyle(el).backgroundColor !== 'rgb(255, 255, 255)'), 'Overview surfaces use the shared dark theme');
  await page.getByRole('button', { name: 'Switch to light theme' }).click();
  profile = { ...profile, score: 0, rank: 0, solvedChallenges: [], solveHistory: [], challengeProgress: [] };
  feed = [];
  await go();
  await page.getByText('Your first solve belongs here.', { exact: true }).waitFor();
  check(await page.getByRole('link', { name: 'Explore challenges', exact: true }).getAttribute('href') === '/challenges', 'New members get a clear first challenge action');
  check(await page.getByText('No recent solves yet. The next one could be yours.', { exact: true }).count() === 1, 'Empty community activity stays inside its box');
  hold = true;
  await go();
  await page.getByText('Loading your progress…', { exact: true }).waitFor();
  await page.getByText('Loading recent solves…', { exact: true }).waitFor();
  check(await page.locator('.overview-summary dd').allTextContents().then(values => values.every(value => value.startsWith('—'))), 'Loading statistics show placeholders instead of fabricated zeros');
  hold = false; releases.splice(0).forEach(resolve => resolve());
  await page.getByText('Your first solve belongs here.', { exact: true }).waitFor();
  failProfile = true; failFeed = true;
  await go();
  await page.locator('.overview-error').waitFor();
  await page.getByText('Recent solves couldn’t be loaded.', { exact: true }).waitFor();
  check(await page.getByText('Your first solve belongs here.', { exact: true }).count() === 0, 'Failed progress fetch does not present an empty-history state');
  failProfile = false; failFeed = false;
  await page.locator('.overview-error').getByRole('button', { name: 'Try again', exact: true }).click();
  await page.locator('.live-solves').getByRole('button', { name: 'Try again', exact: true }).click();
  await page.getByText('Your first solve belongs here.', { exact: true }).waitFor();
  await page.getByText('No recent solves yet. The next one could be yours.', { exact: true }).waitFor();
  check(await page.locator('.overview-error').count() === 0, 'Progress and recent-solves failures can be retried independently');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  feed = [{ id: 'reduced-solve', username: 'solver', challengeId: challenge, challengeTitle: 'Reduced motion challenge', points: 100, timestamp: now }];
  socket.send('42' + JSON.stringify(['leaderboardUpdate']));
  await page.locator('.solve-feed li').waitFor();
  check(await page.locator('.solve-feed li').evaluate(el => getComputedStyle(el).opacity === '1'), 'Reduced motion shows incoming activity immediately');
  check(errors.length === 0, 'No overview runtime errors');
  return { passed: checks.length, checks };
}
