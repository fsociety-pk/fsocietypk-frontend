// Run after browser-fixtures.js. Mock API checks for frontend session restoration.
async (page) => {
  const checks = [];
  const assert = (value, label) => { if (!value) throw new Error(label); checks.push(label); };
  const fixture = async authenticated => page.evaluate(async authenticated => {
    await fetch('/__fixture', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ authenticated, requests: [] }) });
  }, authenticated);
  await fixture(false);
  await page.evaluate(() => {
    sessionStorage.clear();
    localStorage.setItem('fsocietypk-auth', JSON.stringify({ state: { user: { _id: 'stale', username: 'stale_user', role: 'admin' }, isAuthenticated: true }, version: 0 }));
  });
  await page.goto('http://fsociety.test/challenges');
  await page.waitForURL('**/login');
  await page.getByRole('heading', { name: 'Welcome back.', exact: true }).waitFor();
  assert(await page.evaluate(() => localStorage.getItem('fsocietypk-auth')) === null, 'Legacy persisted authentication is removed and cannot grant access');

  await page.getByLabel('Username or email').fill('session_tester');
  await page.getByLabel('Password', { exact: true }).fill('FixturePassword1!');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await page.waitForURL(url => ['/dashboard', '/challenges'].includes(url.pathname));
  await page.locator('.app-sidebar').waitFor();
  assert(await page.evaluate(() => localStorage.getItem('fsocietypk-auth')) === null, 'Login never persists authentication in local storage');
  await page.goto('http://fsociety.test/challenges');
  await page.getByRole('heading', { name: 'Challenges', exact: true }).waitFor();
  checks.push('Page reload restores a valid session from the API');

  await fixture(false);
  await page.reload();
  await page.waitForURL('**/login');
  await page.getByRole('heading', { name: 'Welcome back.', exact: true }).waitFor();
  checks.push('Returning without a valid server session requires login');

  await fixture(true);
  await page.evaluate(() => localStorage.setItem('fsocietypk-auth', '{broken-json'));
  await page.goto('http://fsociety.test/challenges');
  await page.getByRole('heading', { name: 'Challenges', exact: true }).waitFor();
  checks.push('Corrupted legacy storage does not block a valid session');

  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new Error('Storage blocked'); };
    Storage.prototype.setItem = () => { throw new Error('Storage blocked'); };
    Storage.prototype.removeItem = () => { throw new Error('Storage blocked'); };
  });
  await page.reload();
  await page.getByRole('heading', { name: 'Challenges', exact: true }).waitFor();
  checks.push('Session verification works when browser storage is blocked');
  return { mode: 'mock API; browser cookie lifecycle covered separately by backend tests', checks };
}
