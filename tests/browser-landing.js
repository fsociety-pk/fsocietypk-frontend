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
    const animations = heading.getAnimations({ subtree: true });
    animations.forEach(a => a.pause());
    const glyph = heading.querySelectorAll('.hero-orbit-glyph')[3];
    const depth = [];
    const facing = [];
    for (const progress of [.15,.3,.45,.6,.75]) {
      animations.forEach(a => a.currentTime = progress * 6400);
      const matrix = new DOMMatrix(getComputedStyle(glyph).transform);
      depth.push(matrix.m43);
      facing.push(matrix.m11);
    }
    const keyframes = animations[3].effect.getKeyframes();
    animations.forEach(a => a.currentTime = 6400 * .45);
    return { depth, facing, count: animations.length, last: keyframes.at(-1).transform,
      perspective: getComputedStyle(document.querySelector('.hero-orbit-scene')).perspective,
      style: getComputedStyle(document.querySelector('.hero-orbit-scene')).transformStyle };
  });
  check(planes.count === 16, 'Every letter moves independently around the cylinder');
  check(planes.depth.every((z,i) => i % 2 === 0 ? z > 0 : z < 0), 'Two complete circular orbits cross front and back');
  check(planes.facing.every((x,i) => i % 2 === 0 ? x > 0 : x < 0), 'Letters turn fully away on the far side instead of swivelling');
  check(planes.last.includes('rotateY(720deg)'), 'Tangent rotations complete the full 720 degrees');
  check(planes.style === 'preserve-3d' && planes.perspective === '1500px', 'Real cylinder perspective and depth sorting');
  await page.screenshot({ path: '/tmp/landing-orbit-ribbon-front.png' });
  await page.evaluate(() => document.querySelector('.hero-name').getAnimations({subtree:true}).forEach(a => a.currentTime = 6400 * .3));
  await page.screenshot({ path: '/tmp/landing-orbit-ribbon-back.png' });
  await page.evaluate(() => document.querySelector('.hero-name').getAnimations({subtree:true}).forEach(a => a.currentTime = 1900));
  await page.setViewportSize({width:1024,height:900});
  await page.waitForTimeout(150);
  check(await page.locator('.hero-name').evaluate(el => {
    const animations = el.getAnimations({subtree:true});
    return animations.length === 16 && animations.every(a => a.playState === 'paused' && Math.abs(Number(a.currentTime) - 1900) < 1);
  }), 'Resizing recomputes the circular path without restarting its timeline');
  await page.setViewportSize({width:1440,height:900});
  await page.waitForTimeout(150);
  await page.evaluate(() => document.querySelector('.hero-name').getAnimations({subtree:true}).forEach(a => a.finish()));
  await page.locator('.hero-orbit-scene[data-orbit="settled"]').waitFor();
  check(await page.evaluate(() => new DOMMatrix(getComputedStyle(document.querySelector('.hero-name')).transform).m43 === -1), 'Orbit settles behind the figure');
  check(await page.locator('.hero-name').evaluate(el => el.getAnimations({subtree:true}).length === 0), 'Settled letters release all animation layers');
  await page.screenshot({ path: '/tmp/landing-final-desktop.png' });
  for (const width of [1200,1280,1440,1600]) {
    await page.setViewportSize({width,height:900});
    const layout = await page.evaluate(() => {
      const nav = document.querySelector('.public-nav').getBoundingClientRect();
      const brand = document.querySelector('.site-header .brand-lockup').getBoundingClientRect();
      const actions = document.querySelector('.header-actions').getBoundingClientRect();
      const rects = [...document.querySelectorAll('.public-nav>a')].map(el => el.getBoundingClientRect());
      return { center: nav.x + nav.width / 2, width: innerWidth,
        aligned: rects.every(r => Math.abs(r.y + r.height / 2 - (actions.y + actions.height / 2)) < 1),
        targets: rects.every(r => r.height >= 44),
        gap: nav.left - brand.right >= 8 && actions.left - nav.right >= 8 };
    });
    check(Math.abs(layout.center - layout.width / 2) < 1 && layout.aligned, `${width}px navbar labels and badge share a centered baseline`);
    check(layout.targets && layout.gap, `${width}px navigation targets fit without collisions`);
  }
  await page.setViewportSize({width:1440,height:900});
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

  for (const width of [320,390,641,768,1024,1199,1440]) {
    await page.setViewportSize({ width, height: width < 700 ? 844 : 900 });
    await page.evaluate(() => scrollTo({top:0,behavior:'instant'}));
    await page.waitForTimeout(150);
    check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}px landing has no horizontal overflow`);
    await page.locator('.landing-team-invitation').scrollIntoViewIfNeeded();
    check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}px team invitation fits`);
    await page.locator('.library-section').scrollIntoViewIfNeeded();
    check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}px library fits`);
  }

  for (const width of [641,768,1024,1199]) {
    await page.setViewportSize({width,height:900});
    await page.evaluate(() => scrollTo({top:0,behavior:'instant'}));
    check(!await page.locator('.public-nav').isVisible() && await page.getByRole('button',{name:'Open navigation'}).isVisible(), `${width}px uses the menu before header items become crowded`);
    await page.getByRole('button',{name:'Open navigation'}).click();
    await page.locator('#mobile-navigation').evaluate(el => Promise.all(el.getAnimations().map(a => a.finished.catch(() => {}))));
    check(await page.evaluate(() => Math.abs(document.querySelector('.mobile-drawer').getBoundingClientRect().top - document.querySelector('.site-header').getBoundingClientRect().bottom) < 1), `${width}px menu aligns below the header`);
    await page.keyboard.press('Escape');
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => scrollTo({top:0,behavior:'instant'}));
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.locator('#mobile-navigation').evaluate(el => Promise.all(el.getAnimations().map(animation => animation.finished.catch(() => {}))));
  check(await page.evaluate(() => Math.abs(document.querySelector('.mobile-drawer').getBoundingClientRect().top - document.querySelector('.site-header').getBoundingClientRect().bottom) < 1), 'Mobile drawer sits directly below the header');
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
  check(await page.locator('.hero-name').evaluate(el => el.getAnimations({subtree:true}).length === 0), 'Reduced motion skips the orbit');
  check(await page.locator('.hero-name').evaluate(el => new DOMMatrix(getComputedStyle(el).transform).m43 === -1), 'Reduced motion shows the final composition immediately');
  await page.locator('.editorial-intro').scrollIntoViewIfNeeded();
  check(await page.locator('.editorial-intro').evaluate(el => getComputedStyle(el).opacity === '1' && getComputedStyle(el).transform === 'none'), 'Reduced motion leaves reading blocks visible and still');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.evaluate(() => scrollTo({top:0,behavior:'instant'}));
  await page.locator('.hero-orbit-scene[data-orbit="running"]').waitFor();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('.hero-orbit-scene[data-orbit="reduced"]').waitFor();
  check(await page.locator('.hero-name').evaluate(el => el.getAnimations({subtree:true}).length === 0), 'Live reduced-motion changes cancel the orbit');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.evaluate(() => scrollTo({top:0,behavior:'instant'}));
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
