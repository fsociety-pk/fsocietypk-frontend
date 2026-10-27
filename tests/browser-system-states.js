// Run after browser-fixtures.js; all network requests remain intercepted.
async (page) => {
  const checks = [];
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.routeWebSocket('**/socket.io/**', () => {});
  const assert = (ok, label) => { if (!ok) throw new Error(label); checks.push(label); };
  await page.evaluate(async () => {
    localStorage.removeItem('fsocietypk-auth'); sessionStorage.clear();
    await fetch('/__fixture', { method: 'POST', body: JSON.stringify({ authenticated: false }) });
  });
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  const pendingSession = async route => {
    await gate;
    await route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ success: false, message: 'Not authenticated' }) });
  };
  await page.route('**/api/**/auth/me', pendingSession);
  const navigation = page.goto('http://fsociety.test/login');
  try {
    await page.getByRole('heading', { name: 'Checking your session', exact: true }).waitFor();
    assert(await page.getByRole('status').getAttribute('aria-busy') === 'true', 'Loading has an accessible busy status');
    assert(!(await page.getByRole('status').innerText()).toLowerCase().includes('hello'), 'Loading uses relevant session copy');
    assert(await page.getByRole('status').locator('img').count() === 0, 'Loading has no logo');
    const tiles = page.locator('.loading-matrix > span');
    assert(await tiles.count() === 9, 'Loading uses the shared nine-tile activity indicator');
    assert(await tiles.first().evaluate(el => getComputedStyle(el).animationName === 'loading-tile-wave'), 'Loading tiles have the activity animation');
    const before = await page.locator('.loading-track > span').evaluate(el => getComputedStyle(el).transform);
    await page.waitForTimeout(240);
    const after = await page.locator('.loading-track > span').evaluate(el => getComputedStyle(el).transform);
    assert(before !== after, 'Activity bar visibly moves over time');
    const tileOpacity = await tiles.evaluateAll(nodes => nodes.map(node => getComputedStyle(node).opacity));
    await page.waitForTimeout(180);
    assert(JSON.stringify(tileOpacity) !== JSON.stringify(await tiles.evaluateAll(nodes => nodes.map(node => getComputedStyle(node).opacity))), 'Tile animation advances over time');
    for (const [width, height] of [[320,568], [390,844], [768,1024], [1440,900], [844,390]]) {
      await page.setViewportSize({ width, height });
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Loader fits ${width}px`);
      assert(await page.locator('.loading-track').evaluate(el => { const bounds = el.getBoundingClientRect(); return bounds.bottom <= innerHeight && bounds.top >= 0; }), `Loading content fits ${width}x${height}`);
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    for (const theme of ['light', 'dark']) {
      await page.evaluate(theme => { document.documentElement.dataset.theme = theme; }, theme);
      await page.screenshot({ path: `/tmp/fsociety-loading-${theme}.png` });
    }
    await page.setViewportSize({ width: 320, height: 568 });
    await page.screenshot({ path: '/tmp/fsociety-loading-mobile.png' });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert(await page.locator('.loading-matrix > span, .loading-track > span').evaluateAll(nodes => nodes.every(node => getComputedStyle(node).animationName === 'none')), 'Reduced motion stops loading animation');
  } finally {
    release(); await navigation;
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.unroute('**/api/**/auth/me', pendingSession);
  }
  await page.getByRole('heading', { name: 'Welcome back.', exact: true }).waitFor();
  checks.push('Session completion replaces loading with the login form');
  await page.setViewportSize({ width: 1440, height: 900 });
  const member = { _id: '507f1f77bcf86cd799439011', username: 'loading_tester', role: 'user', score: 0, solvedChallenges: [] };
  const memberSession = route => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ success: true, data: member }) });
  await page.route('**/api/**/auth/me', memberSession);
  await page.evaluate(member => localStorage.setItem('fsocietypk-auth', JSON.stringify({ state: { user: member, isAuthenticated: true }, version: 0 })), member);
  for (const [path, apiPath, title, data] of [
    ['/writeups', '/writeups', 'Loading writeups', { writeups: [], pagination: { page: 1, pages: 0, total: 0 } }],
    ['/challenges', '/challenges', 'Loading challenges', []],
    ['/challenges/507f1f77bcf86cd799439022', '/challenges/507f1f77bcf86cd799439022', 'Loading challenge', { _id: '507f1f77bcf86cd799439022', title: 'Loading fixture challenge', category: 'web', description: 'Loading flow fixture', totalFlags: 1, isSolved: false, hints: [], files: [], attachments: [], difficulty: 'easy', points: 50 }],
  ]) {
    let complete;
    const pending = new Promise(resolve => { complete = resolve; });
    const delayed = async route => { await pending; await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ success: true, data }) }); };
    const matches = url => url.pathname === '/api/v1' + apiPath;
    await page.route(matches, delayed);
    const visit = page.goto('http://fsociety.test' + path);
    try {
      await page.getByRole('heading', { name: title, exact: true }).waitFor();
      assert(await page.locator('.loading-matrix').isVisible(), `${title} uses the shared animated design`);
      assert(await page.locator('.loading-track > span').evaluate(el => getComputedStyle(el).animationName === 'loading-track-travel'), `${title} animates inside the workspace`);
      assert(await page.locator('.app-sidebar').isVisible(), `${title} preserves workspace navigation`);
    } finally { complete(); await visit; await page.unroute(matches, delayed); }
    await page.getByRole('heading', { name: title, exact: true }).waitFor({ state: 'hidden' });
    checks.push(`${title} clears after the request finishes`);
  }
  await page.unroute('**/api/**/auth/me', memberSession);
  await page.evaluate(() => localStorage.removeItem('fsocietypk-auth'));
  await page.goto('http://fsociety.test/missing/ctf-route');
  await page.getByRole('heading', { name: 'Page not found.', exact: true }).waitFor();
  assert(page.url().endsWith('/missing/ctf-route'), 'Unknown URL stays on the real 404 page');
  assert(await page.title() === '404 — Page not found | Fsociety PK', '404 has a descriptive page title');
  assert(await page.locator('#not-found-title').evaluate(el => el === document.activeElement), '404 heading receives navigation focus');
  assert(await page.locator('.lost-request code').innerText() === '/missing/ctf-route', '404 shows the requested path');
  assert(!(await page.locator('.lost-page').innerText()).toLowerCase().includes('hello'), '404 uses route-specific copy');
  assert(await page.getByRole('link', { name: 'Back to the community', exact: true }).getAttribute('href') === '/dashboard', 'Signed-out recovery points to the community');
  for (const theme of ['light', 'dark']) {
    await page.evaluate(theme => { document.documentElement.dataset.theme = theme; }, theme);
    for (const [width,height] of [[320,568],[390,844],[768,1024],[1440,900]]) {
      await page.setViewportSize({ width, height });
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${theme} 404 fits ${width}x${height}`);
    }
    await page.screenshot({ path: `/tmp/fsociety-404-${theme}.png`, fullPage: true });
  }
  await page.getByRole('link', { name: 'Explore resources', exact: true }).click();
  await page.waitForURL('**/resources');
  checks.push('404 resources recovery works');
  const longPath = '/missing/' + 'long-path-'.repeat(40);
  await page.goto('http://fsociety.test' + longPath);
  await page.locator('.lost-page').waitFor();
  await page.setViewportSize({ width: 320, height: 568 });
  await page.waitForFunction(() => document.documentElement.scrollWidth <= innerWidth);
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Long unknown paths wrap on small screens');
  const staffSession = route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { _id: '507f1f77bcf86cd799439011', username: 'admin_fixture', role: 'admin', avatar: '' } }) });
  await page.evaluate(() => localStorage.removeItem('fsocietypk-auth'));
  await page.route('**/api/**/auth/me', staffSession);
  try {
    await page.goto('http://fsociety.test/missing-admin-route');
    await page.getByRole('link', { name: 'Back to my workspace', exact: true }).waitFor();
    assert(await page.getByRole('link', { name: 'Back to my workspace', exact: true }).getAttribute('href') === '/admin', 'Staff 404 recovery points to admin');
    assert(page.url().endsWith('/missing-admin-route'), 'Staff can see unknown-route details');
  } finally {
    await page.unroute('**/api/**/auth/me', staffSession);
    await page.evaluate(() => { localStorage.removeItem('fsocietypk-auth'); sessionStorage.clear(); });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.setViewportSize({ width: 1440, height: 900 });
  }
  return { mode: 'mock API', checks };
}
