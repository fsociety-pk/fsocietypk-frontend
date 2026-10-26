// Run after the generated browser-fixtures.js. All API data is mocked.
async (page) => {
  const checks = [];
  const assert = (value, label) => { if (!value) throw new Error(label); checks.push(label); };
  await page.evaluate(() => { localStorage.removeItem('fsocietypk-auth'); sessionStorage.clear(); });
  await page.goto('http://fsociety.test/login');
  await page.waitForLoadState('networkidle');
  await page.clock.install({ time: new Date('2026-10-26T12:00:00Z') });
  await page.clock.pauseAt(new Date('2026-10-26T12:00:01Z'));
  try {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.getByLabel('Username or email').fill("' OR '1'='1");
    await page.getByRole('button', { name: 'Log in', exact: true }).click();
    await page.getByRole('heading', { name: 'Logging in as admin…' }).waitFor();
    assert(await page.locator('#sql-prank-title').evaluate(el => el === document.activeElement), 'Prank heading receives keyboard focus');
    await page.getByRole('button', { name: 'Back to login' }).focus();
    await page.clock.runFor(1400);
    await page.getByRole('heading', { name: 'Welcome back, admin.' }).waitFor();
    assert(await page.getByRole('button', { name: 'Back to login' }).evaluate(el => el === document.activeElement), 'Timed phases do not steal focus from the return button');
    await page.screenshot({ path: '/tmp/sql-prank-welcome.png', animations: 'disabled' });
    await page.clock.runFor(2599);
    assert(await page.locator('.sql-prank-reveal').count() === 0, 'Reveal waits for the requested delay');
    await page.clock.runFor(1);
    await page.getByRole('heading', { name: 'Lol! Did you think that worked?' }).waitFor();
    checks.push('Reveal appears at four seconds');
    await page.clock.resume();
    const messages = [await page.locator('.sql-prank-description').innerText()];
    for (const theme of ['light', 'dark']) {
      await page.evaluate(theme => { document.documentElement.dataset.theme = theme; }, theme);
      for (const width of [320, 390, 768, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await page.waitForFunction(() => document.documentElement.scrollWidth <= innerWidth);
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${theme} reveal has no overflow at ${width}px`);
      }
    }
    await page.screenshot({ path: '/tmp/sql-prank-reveal-desktop.png', animations: 'disabled' });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: '/tmp/sql-prank-reveal-mobile.png', fullPage: true, animations: 'disabled' });
    assert(await page.getByRole('link', { name: 'Find a challenge' }).getAttribute('href') === '/challenges', 'Reveal offers challenge practice');
    await page.getByRole('button', { name: 'Back to login' }).click();
    for (let i = 1; i < 6; i++) {
      await page.getByRole('button', { name: 'Log in', exact: true }).click();
      await page.clock.runFor(4000);
      await page.locator('.sql-prank-reveal').waitFor();
      messages.push(await page.locator('.sql-prank-description').innerText());
      await page.getByRole('button', { name: 'Back to login' }).click();
    }
    assert(new Set(messages).size === 6, 'Six distinct punchlines rotate across attempts');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.getByRole('button', { name: 'Log in', exact: true }).click();
    assert(await page.locator('.sql-prank-spinner').evaluate(el => getComputedStyle(el).animationName) === 'none', 'Reduced motion disables spinner');
    await page.getByRole('button', { name: 'Back to login' }).click();
    await page.clock.runFor(5000);
    assert(await page.locator('.sql-prank').count() === 0, 'Leaving early cancels the sequence');
    assert(await page.getByLabel('Username or email').evaluate(el => el === document.activeElement), 'Early return restores input focus');
    await page.getByLabel('Username or email').fill('<script>alert(1)</script>');
    await page.getByRole('button', { name: 'Log in', exact: true }).click();
    assert((await page.getByRole('alert').innerText()).includes('XSS-style'), 'XSS keeps existing inline feedback');
    await page.getByLabel('Username or email').fill('{"$ne":null}');
    await page.getByRole('button', { name: 'Log in', exact: true }).click();
    assert((await page.getByRole('alert').innerText()).includes('Query-style'), 'NoSQL keeps existing inline feedback');
    await page.getByRole('navigation', { name: 'Account access' }).getByRole('link', { name: 'Sign up', exact: true }).click();
    await page.getByLabel('Email address').fill("' OR 1=1 --");
    await page.getByRole('button', { name: 'Create account', exact: true }).click();
    await page.getByRole('heading', { name: 'Logging in as admin…' }).waitFor();
    await page.getByRole('button', { name: 'Back to signup' }).click();
    assert(await page.getByLabel('Email address').evaluate(el => el === document.activeElement), 'Signup email SQL returns focus to email');
    const requests = await page.evaluate(async () => (await (await fetch('/__fixture')).json()).data.requests);
    assert(!requests.some(request => /\/auth\/(login|register)$/.test(request.path) || request.path.includes('/admin')), 'Pranks never contact auth or admin endpoints');
    assert(!await page.evaluate(() => JSON.parse(localStorage.getItem('fsocietypk-auth'))?.state?.isAuthenticated), 'Pranks never authenticate the visitor');
    await page.getByRole('navigation', { name: 'Account access' }).getByRole('link', { name: 'Log in', exact: true }).click();
    await page.getByLabel('Username or email').fill('fixture_user');
    const sqlPassword = "' OR '1'='1";
    await page.getByLabel('Password', { exact: true }).fill(sqlPassword);
    await page.getByRole('button', { name: 'Log in', exact: true }).click();
    await page.waitForURL('**/dashboard');
    const login = await page.evaluate(async () => (await (await fetch('/__fixture')).json()).data.requests.find(request => request.path.endsWith('/auth/login')));
    assert(login.body.password === sqlPassword, 'SQL-looking passwords remain unchanged and use normal authentication');
    return { mode: 'mock API and controlled clock', checks };
  } finally { await page.clock.resume(); }
}
