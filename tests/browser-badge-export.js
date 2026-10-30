// Run after browser-workspace.js; tests exports without posting to external services.
async (page) => {
  const checks = [];
  const assert = (value, label) => { if (!value) throw new Error(label); checks.push(label); };
  const dialog = page.getByRole('dialog', { name: 'Challenge badge', exact: true });
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    assert(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth), `Badge dialog fits at ${width}px`);
  }
  const downloadPromise = page.waitForEvent('download');
  await dialog.getByRole('button', { name: 'Download badge', exact: true }).click();
  const download = await downloadPromise;
  await download.saveAs('/tmp/continuation-badge-export.svg');
  assert((await download.failure()) === null, 'Badge SVG download succeeds');
  await page.keyboard.press('Escape');
  await dialog.waitFor({ state: 'hidden' });
  assert(await page.locator('.challenge-badge-card').first().evaluate(el => el === document.activeElement), 'Badge closes with Escape and restores focus');
  await page.goto('http://fsociety.test/challenges/507f1f77bcf86cd799439022');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'View badge', exact: true }).click();
  await dialog.waitFor();
  assert((await dialog.locator('.challenge-badge-facts').innerText()).includes('Jan 2025'), 'Reopened badge keeps the actual solve date');
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
