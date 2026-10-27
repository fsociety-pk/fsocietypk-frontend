// Run after browser-auth.js. All API data remains mocked.
async (page) => {
  const checks = [];
  const assert = (value, label) => { if (!value) throw new Error(label); checks.push(label); };
  await page.setViewportSize({ width: 1440, height: 600 });
  await page.goto('http://fsociety.test/leaderboard');
  await page.waitForLoadState('networkidle');
  await page.locator('.podium-card').first().waitFor();
  assert(await page.locator('.podium-card').count() === 3, 'Exactly three podium cards');
  assert(JSON.stringify(await page.locator('tbody tr td:first-child').allTextContents()) === JSON.stringify(['#4', '#5']), 'Remaining table starts at rank four without duplicated winners');
  const sidebar = await page.evaluate(() => {
    const s = document.querySelector('.sidebar-scroll');
    s.scrollTop = s.scrollHeight;
    const b = document.querySelector('.sidebar-footer button').getBoundingClientRect();
    return { scrolls: s.scrollHeight > s.clientHeight && s.scrollTop > 0, signoutVisible: b.top >= 0 && b.bottom <= innerHeight };
  });
  assert(sidebar.scrolls && sidebar.signoutVisible, 'Desktop sidebar scrolls while sign-out remains visible at 1440x600');
  await page.getByLabel('Search members').fill('azerian');
  assert(await page.locator('.podium-card').count() === 0 && (await page.locator('tbody tr').innerText()).includes('#1'), 'Search finds podium member with original rank');
  await page.getByLabel('Search members').fill('');
  await Promise.all([page.waitForResponse(r => r.url().includes('/leaderboard') && r.url().includes('monthly')), page.getByRole('tab', { name: 'This month' }).click()]);
  await Promise.all([page.waitForResponse(r => r.url().includes('/leaderboard') && r.url().includes('weekly')), page.getByRole('tab', { name: 'This week' }).click()]);
  await page.locator('.podium-card').first().waitFor();
  const requests = await page.evaluate(async () => (await (await fetch('/__fixture')).json()).data.requests);
  assert(requests.some(r => r.search.includes('monthly')) && requests.some(r => r.search.includes('weekly')), 'Ranking period tabs request the selected period');
  assert(await page.evaluate(() => document.documentElement.dataset.theme === 'dark'), 'Dark theme applies permanently');
  await page.setViewportSize({ width: 720, height: 300 });
  await page.getByRole('button', { name: 'Open navigation' }).click();
  const drawer = page.getByRole('dialog', { name: 'Navigation' });
  await drawer.getByRole('button', { name: 'Sign out' }).scrollIntoViewIfNeeded();
  assert(await drawer.getByRole('button', { name: 'Sign out' }).isVisible(), 'Sign-out reachable at the viewport equivalent of 200% zoom');
  await page.keyboard.press('Escape');
  assert(await page.getByRole('button', { name: 'Open navigation' }).evaluate(el => el === document.activeElement), 'Escape closes mobile navigation and restores focus');
  for (const width of [320, 390, 768, 1024]) {
    await page.setViewportSize({ width, height: 844 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Leaderboard has no page overflow at ${width}px`);
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://fsociety.test/profile');
  await page.waitForLoadState('networkidle');
  await page.getByLabel('Upload profile photo').setInputFiles('/home/sheriff/fsocietypk-web/fsocietypk-frontend/public/brand/masked-portrait.png');
  await page.getByRole('button', { name: 'Save photo', exact: true }).click();
  await page.getByRole('button', { name: 'Save photo', exact: true }).waitFor({ state: 'hidden' });
  const saved = await page.evaluate(async () => (await (await fetch('/__fixture')).json()).data.avatar);
  assert(saved.startsWith('data:image/jpeg;base64,'), 'Profile upload sends converted JPEG');
  await page.reload();
  await page.waitForLoadState('networkidle');
  assert(await page.locator('.profile-avatar img').getAttribute('src') === saved, 'Saved avatar renders after reload with mock persistence');
  const dimensions = await page.locator('.profile-avatar img').evaluate(el => ({ width: el.naturalWidth, height: el.naturalHeight }));
  assert(dimensions.width === 400 && dimensions.height === 400, 'Avatar is cropped to 400x400');
  await page.getByRole('tab', { name: 'Certificates', exact: true }).click();
  await page.getByRole('button', { name: 'View achievement certificate' }).click();
  await page.getByRole('dialog', { name: 'Your achievement certificate' }).waitFor();
  assert((await page.locator('[role="dialog"] svg[role="img"]').textContent()).includes('02 January 2025'), 'Profile certificate uses recorded completion date');
  await page.screenshot({ path: '/home/sheriff/fsocietypk-web/.playwright-mcp/continuation-certificate.png', fullPage: true });
  return { mode: 'mock API', checks, avatar: dimensions };
}
