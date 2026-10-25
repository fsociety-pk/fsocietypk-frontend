// Run after browser-workspace.js; tests exports without posting to external services.
async (page) => {
  const checks = [];
  const assert = (value, label) => { if (!value) throw new Error(label); checks.push(label); };
  const dialog = page.getByRole('dialog', { name: 'Achievement certificate' });
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    assert(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth), `Certificate dialog fits at ${width}px`);
    const svg = await dialog.locator('svg[role="img"]').boundingBox();
    assert(svg.width <= width - 32, `Certificate SVG scales to viewport at ${width}px`);
  }
  await page.screenshot({ path: '/home/sheriff/fsocietypk-web/.playwright-mcp/continuation-certificate-mobile.png', fullPage: true });
  await page.setViewportSize({ width: 1440, height: 900 });
  await dialog.evaluate(el => { el.scrollTop = 0; });
  await page.screenshot({ path: '/home/sheriff/fsocietypk-web/.playwright-mcp/continuation-certificate.png', fullPage: true });
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download PNG', exact: true }).click();
  const download = await downloadPromise;
  await download.saveAs('/home/sheriff/fsocietypk-web/.playwright-mcp/continuation-certificate.png-export.png');
  assert((await download.failure()) === null, 'PNG download succeeds');
  await page.addInitScript(() => { window.print = () => document.documentElement.setAttribute('data-print-requested', 'true'); });
  await page.getByRole('button', { name: 'Print / Save PDF', exact: true }).click();
  const frame = page.frameLocator('iframe[title="Print achievement certificate"]');
  await frame.locator('html[data-print-requested="true"]').waitFor();
  checks.push('Print button invokes the browser print flow');
  const html = await frame.locator('html').evaluate(el => el.outerHTML);
  const printPage = await page.context().newPage();
  await printPage.setContent(html);
  await printPage.pdf({ path: '/home/sheriff/fsocietypk-web/.playwright-mcp/continuation-certificate.pdf', preferCSSPageSize: true, printBackground: true });
  await printPage.close();
  await page.keyboard.press('Escape');
  await dialog.waitFor({ state: 'hidden' });
  assert(await page.getByRole('button', { name: 'View achievement certificate' }).evaluate(el => el === document.activeElement), 'Certificate closes with Escape and restores focus');
  await page.goto('http://fsociety.test/challenges/507f1f77bcf86cd799439022');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: /certificate/i }).first().click();
  await page.getByRole('dialog', { name: 'Achievement certificate' }).waitFor();
  assert((await page.locator('[role="dialog"] svg[role="img"]').textContent()).includes('02 January 2025'), 'Reopened challenge certificate keeps actual solve date');
  await page.keyboard.press('Escape');
  await page.goto('http://fsociety.test/profile');
  await page.waitForLoadState('networkidle');
  await page.getByRole('tab', { name: 'Settings', exact: true }).click();
  await page.getByLabel('Current password', { exact: true }).fill('FixturePassword1!');
  await page.getByLabel('New password', { exact: true }).fill('UpdatedFixture1!');
  await page.getByLabel('Confirm new password', { exact: true }).fill('UpdatedFixture1!');
  await page.getByRole('button', { name: 'Update password', exact: true }).click();
  await page.getByRole('heading', { name: 'Welcome back.' }).waitFor();
  const fixture = await page.evaluate(async () => (await (await fetch('/__fixture')).json()).data);
  const passwordRequest = fixture.requests.find(r => r.path.endsWith('/change-password'));
  assert(passwordRequest.body.confirmPassword === 'UpdatedFixture1!', 'Password confirmation is sent to API');
  assert(!fixture.authenticated, 'Password change returns to login');
  assert(fixture.errors.length === 0, 'No uncaught browser JavaScript errors during fixture checks');
  return { mode: 'mock API', checks };
}
