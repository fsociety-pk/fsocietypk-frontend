// Run after prepare-browser.cjs + browser-fixtures.js with the connected browser.
// Uses the production build and intercepted APIs; creates no accounts or records.
async page => {
  const checks = [];
  const check = (condition, name) => { if (!condition) throw new Error(name); checks.push(name); };
  const origin = 'http://fsociety.test';
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.evaluate(() => localStorage.setItem('fsociety-theme', 'light'));
  await page.goto(origin + '/dashboard');
  await page.locator('.hero-orbit-scene[data-orbit="running"]').waitFor();
  check(await page.locator('.cinematic-intro').count() === 0, 'Fresh visit has no splash');
  check(await page.evaluate(() => !document.getElementById('root').inert && document.body.style.overflow !== 'hidden'), 'Landing controls and scroll are immediately available');
  check(await page.getByRole('heading', { name: 'Fsociety Pakistan', exact: true }).count() === 1, 'One accessible brand heading');
  const planes = await page.evaluate(() => {
    const heading = document.querySelector('.hero-name');
    const animation = heading.getAnimations()[0];
    animation.pause();
    const depth = [];
    for (const time of [5200 / 3, 2600, 5200 * 2 / 3]) {
      animation.currentTime = time;
      depth.push(new DOMMatrix(getComputedStyle(heading).transform).m43);
    }
    animation.currentTime = 1950;
    return { depth, matrix: getComputedStyle(heading).transform, perspective: getComputedStyle(document.querySelector('.hero-orbit-scene')).perspective, style: getComputedStyle(document.querySelector('.hero-orbit-scene')).transformStyle };
  });
  check(planes.depth[0] > 0 && planes.depth[1] < 0 && planes.depth[2] > 0, 'Two orbits cross in front of and behind the portrait');
  check(planes.style === 'preserve-3d' && planes.perspective === '1500px' && planes.matrix.startsWith('matrix3d'), 'Real perspective and 3D transforms');
  await page.screenshot({ path: '/tmp/landing-orbit-perspective.png' });
  await page.evaluate(() => { const a = document.querySelector('.hero-name').getAnimations()[0]; a.currentTime = 5200 / 3; });
  await page.screenshot({ path: '/tmp/landing-orbit-in-front.png' });
  await page.evaluate(() => document.querySelector('.hero-name').getAnimations()[0].finish());
  await page.locator('.hero-orbit-scene[data-orbit="settled"]').waitFor();
  check(await page.evaluate(() => new DOMMatrix(getComputedStyle(document.querySelector('.hero-name')).transform).m43 === -1), 'Orbit settles behind the figure');
  await page.screenshot({ path: '/tmp/landing-final-desktop.png' });
  const team = page.locator('.public-nav .nav-team-link');
  check(await team.getAttribute('href') === 'https://about.fsocietypk.tech' && await team.getAttribute('target') === '_blank', 'Team badge opens the existing subdomain in a new tab');
  check((await team.getAttribute('rel')).includes('noopener'), 'Team tab retains opener protection');
  check(await page.locator('.landing-team-invitation').getAttribute('href') === 'https://about.fsocietypk.tech', 'Team invitation has the correct destination');
  await page.locator('.nav-login').hover();
  await page.waitForTimeout(280);
  check(await page.locator('.nav-login').evaluate(el => getComputedStyle(el, '::after').transform === 'matrix(1, 0, 0, 1, 0, 0)'), 'Login underline draws on hover');
  await page.locator('.nav-signup').focus();
  await page.waitForTimeout(340);
  check(await page.locator('.nav-signup').evaluate(el => getComputedStyle(el, '::before').transform === 'matrix(1, 0, 0, 1, 0, 0)'), 'Signup fill responds to keyboard focus');
  check(await page.locator('.nav-signup').evaluate(el => getComputedStyle(el).outlineStyle !== 'none'), 'Signup has a visible focus indicator');

  const scrollBlock = async position => {
    await page.locator('.nav-signup').evaluate(el => el.blur());
    await page.evaluate(position => {
      const r = document.querySelector('.editorial-intro').getBoundingClientRect();
      const top = r.top + scrollY;
      scrollTo({ top: position === 'enter' ? top - innerHeight + 35 : position === 'leave' ? top + r.height - 25 : top - 150, behavior: 'instant' });
    }, position);
    await page.waitForTimeout(200);
    return page.locator('.editorial-intro').evaluate(el => Number(getComputedStyle(el).opacity));
  };
  check(await scrollBlock('enter') < .5, 'Text fades in at the lower viewport edge');
  check(await scrollBlock('middle') === 1, 'Text is fully readable through the viewport center');
  check(await scrollBlock('leave') < .5, 'Text fades out at the top edge');
  check(await scrollBlock('middle') === 1, 'Scrolling back restores text');
  await page.screenshot({ path: '/tmp/landing-final-practice.png' });
  await page.locator('.landing-team-invitation').scrollIntoViewIfNeeded();
  await page.screenshot({ path: '/tmp/landing-final-team.png' });

  for (const width of [320,390,768,1024,1440]) {
    await page.setViewportSize({ width, height: width < 700 ? 844 : 900 });
    await page.evaluate(() => scrollTo(0,0));
    await page.waitForTimeout(150);
    check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}px landing has no horizontal overflow`);
    await page.locator('.landing-team-invitation').scrollIntoViewIfNeeded();
    check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}px team invitation fits`);
    await page.locator('.library-section').scrollIntoViewIfNeeded();
    check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}px library fits`);
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => scrollTo(0,0));
  await page.getByRole('button', { name: 'Open navigation' }).click();
  const mobileTeam = page.locator('#mobile-navigation .nav-team-link');
  check(await mobileTeam.isVisible(), 'Mobile navigation has the distinct team badge');
  check(await mobileTeam.getAttribute('target') === '_blank', 'Mobile team link opens a new tab');
  await page.keyboard.press('Escape');
  check(await page.getByRole('button', { name: 'Open navigation' }).evaluate(el => document.activeElement === el), 'Escape closes mobile navigation and restores focus');
  await page.screenshot({ path: '/tmp/landing-final-phone.png' });
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await page.screenshot({ path: '/tmp/landing-final-phone-dark.png' });
  check(await page.evaluate(() => document.documentElement.dataset.theme === 'dark'), 'Dark theme applies to landing');
  await page.getByRole('button', { name: 'Switch to light theme' }).click();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await page.locator('.hero-orbit-scene[data-orbit="reduced"]').waitFor();
  check(await page.locator('.hero-name').evaluate(el => el.getAnimations().length === 0), 'Reduced motion skips the orbit');
  check(await page.locator('.hero-name').evaluate(el => new DOMMatrix(getComputedStyle(el).transform).m43 === -1), 'Reduced motion shows the final composition immediately');
  await page.locator('.editorial-intro').scrollIntoViewIfNeeded();
  check(await page.locator('.editorial-intro').evaluate(el => getComputedStyle(el).opacity === '1' && getComputedStyle(el).transform === 'none'), 'Reduced motion leaves reading blocks visible and still');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.evaluate(() => scrollTo(0,0));
  await page.locator('.hero-orbit-scene[data-orbit="running"]').waitFor();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('.hero-orbit-scene[data-orbit="reduced"]').waitFor();
  check(await page.locator('.hero-name').evaluate(el => el.getAnimations().length === 0), 'Live reduced-motion changes cancel the orbit');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.evaluate(() => scrollTo(0,0));
  await page.locator('.nav-login').click();
  await page.waitForURL('**/login');
  await page.locator('.access-shell').waitFor();
  check(await page.locator('.hero-orbit-scene').count() === 0, 'Navigating to login unmounts the scene');
  await page.goBack();
  await page.locator('.nav-signup').click();
  await page.waitForURL('**/signup');
  await page.getByRole('button', { name: 'Create account', exact: true }).waitFor();
  check(await page.getByRole('button', { name: 'Create account', exact: true }).isVisible(), 'Signup remains functional');
  const fixture = await page.evaluate(async () => (await (await fetch('/__fixture')).json()).data);
  check(fixture.errors.length === 0, 'No browser runtime errors');
  return { passed: checks.length, checks };
}
