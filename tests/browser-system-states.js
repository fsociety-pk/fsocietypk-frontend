// Run after browser-fixtures.js; all network requests remain intercepted.
async (page) => {
  const checks = [];
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
    assert(await page.getByRole('status').locator('.loading-orbit-head').evaluate(el => getComputedStyle(el).animationName === 'loading-orbit-turn'), 'Loading indicator animates');
    for (const width of [320, 390, 1440]) {
      await page.setViewportSize({ width, height: 800 });
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Loader fits ${width}px`);
    }
    for (const theme of ['light', 'dark']) {
      await page.evaluate(theme => { document.documentElement.dataset.theme = theme; }, theme);
      await page.screenshot({ path: `/tmp/fsociety-loading-${theme}.png` });
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert(await page.locator('.loading-orbit-head, .loading-orbit-center').evaluateAll(nodes => nodes.every(node => getComputedStyle(node).animationName === 'none')), 'Reduced motion stops loading animation');
  } finally {
    release(); await navigation;
    await page.unroute('**/api/**/auth/me', pendingSession);
  }
  await page.getByRole('heading', { name: 'Welcome back.', exact: true }).waitFor();
  checks.push('Session completion replaces loading with the login form');
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
