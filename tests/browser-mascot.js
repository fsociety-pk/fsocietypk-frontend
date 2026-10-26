// Run after browser-fixtures.js; API calls remain intercepted.
async (page) => {
  const checks = [];
  const assert = (ok, label) => { if (!ok) throw new Error(label); checks.push(label); };
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.evaluate(async () => {
    localStorage.removeItem('fsocietypk-auth'); sessionStorage.clear();
    await fetch('/__fixture', { method: 'POST', body: JSON.stringify({ authenticated: false }) });
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://fsociety.test/signup');
  await page.locator('.cartoon-crew').waitFor();
  assert(await page.locator('.companion').count() === 3, 'Three original cartoon companions');
  assert(await page.locator('.companion-eye').count() === 6, 'Six expressive eyes');
  assert(await page.locator('.fsociety-art, .companion-buttons').count() === 0, 'No masked person or extra body eyes');
  assert(await page.locator('.crew-reach').count() === 4, 'Four connected arms for the neighbours');
  await page.mouse.move(10, 350);
  await page.waitForFunction(() => parseFloat(document.querySelector('.companion-green').style.getPropertyValue('--look-x')) < 0);
  await page.mouse.move(1400, 350);
  await page.waitForFunction(() => parseFloat(document.querySelector('.companion-green').style.getPropertyValue('--look-x')) > 0);
  checks.push('Mouse gaze follows both directions');
  await page.getByLabel('Email address').fill('fixture@example.invalid');
  const emailGaze = await page.locator('.companion-green').evaluate(el => parseFloat(el.style.getPropertyValue('--look-x')));
  await page.getByLabel('Username', { exact: true }).fill('fixture_user');
  const usernameGaze = await page.locator('.companion-green').evaluate(el => parseFloat(el.style.getPropertyValue('--look-x')));
  assert(emailGaze < usernameGaze, 'Gaze follows the actual email and username field positions');
  await page.getByLabel('Password', { exact: true }).fill('FixturePassword1!');
  assert(await page.locator('.cartoon-crew.is-private').count() === 1, 'Masked password looks away');
  assert(await page.locator('.companion-green').evaluate(el => parseFloat(el.style.getPropertyValue('--look-y')) < 0), 'Masked password directs gaze up');
  await page.getByRole('button', { name: 'Show password', exact: true }).click();
  await page.waitForFunction(() => document.querySelector('.crew-privacy-arms').dataset.progress === '1');
  const coveredEyes = async () => page.evaluate(() => {
    const stage = document.querySelector('.companion-stage');
    const covered = new Set();
    for (const group of stage.querySelectorAll('.crew-reach')) {
      if (group.dataset.owner === group.dataset.target) return false;
      const hand = group.querySelector('.crew-hand');
      const eyes = stage.querySelectorAll(`.companion-${group.dataset.target} .companion-eye${group.dataset.eyes === 'both' ? '' : '.' + group.dataset.eyes}`);
      for (const eye of eyes) {
        const rect = eye.getBoundingClientRect();
        for (const [dx,dy] of [[.5,.5],[.25,.25],[.75,.25],[.25,.75],[.75,.75]]) {
          const point = new DOMPoint(rect.left + rect.width * dx, rect.top + rect.height * dy).matrixTransform(hand.getScreenCTM().inverse());
          if (!hand.isPointInFill(point)) return false;
        }
        covered.add(eye);
      }
    }
    return covered.size === 6;
  });
  assert(await coveredEyes(), 'All six eyes are physically covered by another character’s hand');
  assert((await page.locator('.companion-bubble').innerText()).includes('Friends cover for friends'), 'Privacy caption describes friends helping');
  await page.getByRole('button', { name: 'Say hello to the crew' }).click();
  assert(await page.locator('.companion-head').evaluateAll(heads => heads.every(head => getComputedStyle(head).animationName === 'none')), 'Greeting cannot override password privacy');
  await page.getByRole('button', { name: 'Hide password', exact: true }).click();
  await page.waitForFunction(() => document.querySelector('.crew-privacy-arms').dataset.progress === '0');
  assert(await page.locator('.crew-privacy-arms').evaluate(el => getComputedStyle(el).opacity === '0'), 'Hiding password retracts hands');
  await page.getByRole('button', { name: 'Say hello to the crew' }).click();
  assert(await page.locator('.companion-green .companion-head').evaluate(el => getComputedStyle(el).animationName) === 'crew-hello', 'Greeting gives a friendly head wiggle');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  assert(await page.locator('.companion-green .companion-head').evaluate(el => getComputedStyle(el).animationName) === 'none', 'Reduced motion disables greeting animation');
  await page.getByRole('button', { name: 'Show password', exact: true }).click();
  assert(await coveredEyes(), 'Reduced motion positions hands immediately');
  for (const width of [320,390,768,1440]) {
    await page.setViewportSize({ width, height: 900 });
    assert(await coveredEyes(), `Hands cover their neighbours after resize to ${width}px`);
  }
  await page.getByRole('button', { name: 'Hide password', exact: true }).click();
  await page.getByRole('button', { name: 'Show password', exact: true }).click();
  assert(await coveredEyes(), 'Rapid visibility toggling keeps every hand aligned');
  for (const route of ['signup', 'login']) {
    await page.goto(`http://fsociety.test/${route}`);
    await page.locator('.cartoon-crew').waitFor();
    for (const [width, height] of [[320,568],[375,667],[390,844],[768,1024],[1440,768],[1440,900]]) {
      await page.setViewportSize({ width, height });
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${route} fits horizontally at ${width}x${height}`);
      const button = page.getByRole('button', { name: route === 'signup' ? 'Create account' : 'Log in', exact: true });
      await button.scrollIntoViewIfNeeded();
      assert(await button.isVisible(), `${route} submit remains reachable at ${width}x${height}`);
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => { document.documentElement.dataset.theme = 'dark'; });
  await page.screenshot({ path: '/tmp/crew-login-dark-mobile.png', fullPage: true });
  await page.evaluate(() => { document.documentElement.dataset.theme = 'light'; });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  return { mode: 'mock API', checks };
}
