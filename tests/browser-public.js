// Run after browser-certificate.js has logged out the fixture user.
async (page) => {
  const checks = [];
  const assert = (value, label) => { if (!value) throw new Error(label); checks.push(label); };
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('navigation', { name: 'Account access' }).getByRole('link', { name: 'Sign up' }).click();
  await page.getByRole('heading', { name: 'Join the collective.' }).waitFor();
  for (const width of [320, 390, 768, 1024]) {
    await page.setViewportSize({ width, height: 844 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Signup fits at ${width}px`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: '/home/sheriff/fsocietypk-web/.playwright-mcp/continuation-signup-mobile.png', fullPage: true });
  await page.goto('http://fsociety.test/dashboard');
  await page.waitForLoadState('networkidle');
  await page.getByRole('heading', { name: 'Fsociety PK', exact: true }).waitFor();
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Landing fits at 390px');
  await page.screenshot({ path: '/home/sheriff/fsocietypk-web/.playwright-mcp/continuation-landing-mobile.png', fullPage: true });
  await page.setViewportSize({ width: 1440, height: 900 });
  const motion = await page.evaluate(() => ({
    filter: getComputedStyle(document.querySelector('.hero-portrait img')).filter,
    hidden: [...document.querySelectorAll('[data-reveal]')].filter(el => getComputedStyle(el).opacity === '0').length,
  }));
  assert(motion.filter === 'none' && motion.hidden === 0, 'Reduced motion keeps sections visible and disables portrait filter');
  await page.screenshot({ path: '/home/sheriff/fsocietypk-web/.playwright-mcp/continuation-landing-dark.png', fullPage: false });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  return { mode: 'mock API / external font requests suppressed', checks };
}
