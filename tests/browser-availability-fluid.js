// Run after browser-fixtures.js. API responses are mocked; auth backgrounds stay static.
async (page) => {
  const checks = [];
  const assert = (ok, label) => { if (!ok) throw new Error(label); checks.push(label); };
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.evaluate(async () => { localStorage.removeItem('fsocietypk-auth'); localStorage.setItem('fsociety-theme', 'light'); sessionStorage.clear(); await fetch('/__fixture', { method: 'POST', body: JSON.stringify({ authenticated: false, requests: [] }) }); });
  await page.goto('http://fsociety.test/signup');
  await page.locator('.signup-mode').waitFor();
  const requests = [];
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  const pattern = /\/auth\/username-availability(?:\?|$)/;
  const availability = async route => {
    const headers = { 'Access-Control-Allow-Origin': 'http://fsociety.test', 'Access-Control-Allow-Credentials': 'true' };
    const username = new URL(route.request().url()).searchParams.get('username');
    requests.push(username);
    if (username === 'stale_taken') await gate;
    try {
      if (username === 'check_fault') return await route.fulfill({ status: 503, headers, contentType: 'application/json', body: JSON.stringify({ success: false, message: 'Fixture check unavailable' }) });
      await route.fulfill({ status: 200, headers, contentType: 'application/json', body: JSON.stringify({ success: true, data: { username, available: !['taken_name','stale_taken'].includes(username) } }) });
    } catch { /* A changed username aborts the old request. */ }
  };
  await page.route(pattern, availability);
  try {
    const input = page.getByLabel('Username', { exact: true });
    await input.fill('ab'); await page.waitForTimeout(550);
    assert(requests.length === 0, 'Invalid short names do not reach the availability endpoint');
    await input.fill('first_name'); await page.waitForTimeout(100); await input.fill('second_name');
    await page.locator('.username-availability.is-available').waitFor();
    assert(JSON.stringify(requests) === JSON.stringify(['second_name']), 'Typing is debounced and skips the superseded name');
    await input.fill(' UPPER_NAME '); await page.locator('.username-availability.is-available').waitFor();
    assert(requests.at(-1) === 'upper_name', 'Availability uses the same normalized username as signup');
    await input.fill('stale_taken');
    await page.waitForFunction(() => document.querySelector('.username-availability')?.textContent.includes('Checking'));
    // Wait until the request is in flight, then change the name before its delayed answer.
    await page.waitForTimeout(550); assert(requests.includes('stale_taken'), 'Delayed availability request started');
    await input.fill('fresh_name'); await page.locator('.username-availability.is-available').waitFor();
    release(); await page.waitForTimeout(100);
    assert(await page.locator('.username-availability.is-available').count() === 1 && await page.locator('#username-error').count() === 0, 'A stale taken result cannot override the current name');
    await input.fill('taken_name'); await page.locator('.username-availability.is-taken').waitFor();
    assert(await input.getAttribute('aria-invalid') === 'true', 'Taken names are marked invalid while typing');
    assert((await page.locator('.companion-bubble').innerText()).includes('That name is taken'), 'The crew helps when a name is taken');
    await page.getByLabel('Email address').fill('fixture@example.invalid'); await page.getByLabel('Password', { exact: true }).fill('StrongPassword1!');
    await page.getByRole('button', { name: 'Create account', exact: true }).click();
    assert(await page.locator('.signup-mode').count() === 1, 'Known taken usernames cannot submit registration');
    await input.focus(); await page.locator('.username-ideas button').first().click();
    await page.locator('.username-availability.is-available').waitFor();
    assert(await page.locator('#username-error').count() === 0, 'Choosing a free suggestion clears the taken error');
    const beforeSql = requests.length;
    await input.fill("' OR '1'='1"); await page.waitForTimeout(550);
    assert(requests.length === beforeSql && await page.locator('.username-availability').count() === 0, 'SQL input stays quiet and is never sent to the checker');
    await input.fill('check_fault'); await page.locator('.username-availability.is-error').waitFor();
    assert((await page.locator('.username-availability').innerText()).includes('Check unavailable'), 'An API failure is shown honestly');
    await page.getByRole('button', { name: 'Create account', exact: true }).click();
    await page.getByRole('heading', { name: 'Check your inbox.', exact: true }).waitFor();
    checks.push('A checker outage does not block normal registration');
  } finally { release(); await page.unroute(pattern, availability); }
  await page.evaluate(() => sessionStorage.clear());
  await page.goto('http://fsociety.test/login'); await page.locator('.login-mode').waitFor();
  await page.getByLabel('Username or email').fill('login_name'); await page.waitForTimeout(550);
  const fixture = await page.evaluate(async () => (await (await fetch('/__fixture')).json()).data);
  assert(!fixture.requests.some(request => request.path.endsWith('/username-availability')), 'Login never checks username availability');
  assert(await page.locator('.auth-fluid,iframe[src*="/auth-fluid/"]').count() === 0, 'Login has no fluid background or simulation frame');
  await page.getByLabel('Password', { exact: true }).fill('StillUsable1!');
  assert(await page.getByLabel('Password', { exact: true }).inputValue() === 'StillUsable1!', 'Login password entry remains usable');
  await page.getByRole('button', { name: 'Switch to dark theme', exact: true }).click();
  assert(await page.locator('.auth-fluid').count() === 0, 'Dark login has no fluid background');
  await page.getByRole('navigation', { name: 'Account access' }).getByRole('link', { name: 'Sign up', exact: true }).click();
  await page.locator('.signup-mode').waitFor();
  assert(await page.locator('.auth-fluid,iframe[src*="/auth-fluid/"]').count() === 0, 'Signup has no fluid background or simulation frame');
  for (const width of [320,390,768,1440]) {
    await page.setViewportSize({ width, height: 844 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Auth form causes no overflow at ${width}px`);
  }
  await page.getByLabel('Username', { exact: true }).fill("' OR '1'='1");
  await page.getByRole('button', { name: 'Create account', exact: true }).click();
  assert(await page.locator('.auth-fluid').count() === 0, 'The prank has no fluid background');
  await page.goto('http://fsociety.test/missing-route'); await page.locator('.lost-page').waitFor();
  assert(await page.locator('.auth-fluid').count() === 0, '404 has no auth fluid');
  await page.evaluate(() => { sessionStorage.setItem('fsociety-cinematic-intro-v1', 'seen'); });
  await page.goto('http://fsociety.test/dashboard'); await page.locator('.cinematic-landing').waitFor();
  assert(await page.locator('.auth-fluid').count() === 0, 'The public landing page has no auth fluid');
  await page.setViewportSize({ width: 1440, height: 900 });
  return { mode: 'mock API; static auth backgrounds', checks };
}
