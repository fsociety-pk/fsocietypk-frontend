// Production frontend with mock API; run after the generated browser fixtures.
async (page) => {
  const origin = 'http://fsociety.test';
  const target = 'https://challenge.example.test:8443/lab?stage=1';
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const user = { _id: '507f1f77bcf86cd799439011', username: 'obsidian', role: 'admin', score: 0, solvedChallenges: [], createdAt: '2026-01-01T00:00:00Z' };
  const requests = [];
  const records = [];
  await page.route('**/api/**', async route => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    const json = data => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, statusCode: 200, data }) });
    if (path.endsWith('/auth/me')) return json(user);
    if (path.endsWith('/notifications/unread-count')) return json({ unreadCount: 0 });
    if (path.endsWith('/challenges') && request.method() === 'POST') {
      const raw = request.postDataBuffer().toString();
      const field = name => raw.match(new RegExp('name="' + name + '"\\r\\n\\r\\n([^\\r]*)'))?.[1];
      requests.push({ url: field('challengeUrl'), hasFile: raw.includes('filename="evidence.zip"') });
      const record = {
        _id: '507f1f77bcf86cd7994390' + (22 + records.length), title: field('title'),
        category: field('category'), difficulty: field('difficulty'), description: field('description'),
        challengeUrl: field('challengeUrl'), points: 50, hints: [], files: [], attachments: [],
        createdBy: user._id, author: user, status: 'approved', isActive: true, liveStatus: 'live',
        totalFlags: 1, completedFlags: 0, completedSequences: [], isSolved: false, solveCount: 0,
        createdAt: '2026-10-25T12:00:00Z',
      };
      records.push(record);
      return json(record);
    }
    if (path.endsWith('/admin/challenges') || path.endsWith('/challenges/my-submissions')) return json(records);
    if (path.endsWith('/solvers')) return json([]);
    const record = records.find(c => path.endsWith('/challenges/' + c._id));
    return json(record || []);
  });
  await page.evaluate(user => {
    localStorage.setItem('fsocietypk-auth', JSON.stringify({ state: { user, isAuthenticated: true }, version: 0 }));
    localStorage.setItem('fsociety-theme', 'light');
  }, user);
  let checks = 0;
  const check = (condition, message) => { if (!condition) throw new Error(message); checks++; };
  const go = async path => { await page.goto(origin + path); await page.waitForLoadState('networkidle'); };
  const fill = async title => {
    await page.locator('#challenge-title').fill(title);
    await page.locator('#challenge-description').fill('Find the flag on the linked website.');
    await page.locator('#challenge-category').selectOption('web');
    await page.locator('#challenge-difficulty').selectOption('easy');
    await page.locator('#challenge-flag').fill('fsociety{browser_test}');
  };
  await page.setViewportSize({ width: 1440, height: 1000 });
  await go('/submit-challenge');
  await fill('Website target without files');
  const urlInput = page.getByRole('textbox', { name: 'Challenge URL', exact: true });
  check(await urlInput.getAttribute('type') === 'url', 'URL field uses URL keyboard/native validation');
  await urlInput.fill('ftp://example.test');
  await page.getByRole('button', { name: 'Publish challenge', exact: true }).click();
  await page.locator('#challenge-url-error').waitFor();
  check(requests.length === 0, 'Invalid protocol never reaches API');
  check(await urlInput.getAttribute('aria-invalid') === 'true', 'URL error is accessible');
  await urlInput.fill(target);
  await page.getByRole('button', { name: 'Publish challenge', exact: true }).click();
  await page.getByRole('heading', { name: 'Challenge published', exact: true }).waitFor();
  check(requests[0].url === target && !requests[0].hasFile, 'URL-only challenge submits without any attachment');
  await go('/challenges/' + records[0]._id);
  const open = page.getByRole('link', { name: /Open challenge/ });
  check(await open.getAttribute('href') === target, 'Challenge detail displays exact target URL');
  check(await open.getAttribute('target') === '_blank' && (await open.getAttribute('rel')).includes('noopener'), 'Target opens safely in a separate tab');
  await page.screenshot({ path: '.playwright-mcp/challenge-website-desktop.png', fullPage: true });
  await go('/submissions');
  check(await page.getByRole('link', { name: 'Challenge URL: ' + target, exact: true }).isVisible(), 'Author can see submitted URL');
  await go('/admin/challenges');
  check(await page.getByRole('link', { name: 'Challenge URL: ' + target, exact: true }).isVisible(), 'Admin can inspect target during review');

  await go('/submit-challenge');
  await fill('Target with supporting archive');
  await page.getByRole('textbox', { name: 'Challenge URL', exact: true }).fill(target);
  await page.locator('input[type="file"]').setInputFiles({ name: 'evidence.zip', mimeType: 'application/zip', buffer: Buffer.from('PK\u0003\u0004browser-fixture') });
  await page.getByRole('button', { name: 'Publish challenge', exact: true }).click();
  await page.getByRole('heading', { name: 'Challenge published', exact: true }).waitFor();
  check(requests[1].url === target && requests[1].hasFile, 'Link and uploaded file travel together in multipart request');
  await go('/submit-challenge');
  await fill('Archive without a target URL');
  await page.locator('input[type="file"]').setInputFiles({ name: 'evidence.zip', mimeType: 'application/zip', buffer: Buffer.from('PK\u0003\u0004browser-fixture') });
  await page.getByRole('button', { name: 'Publish challenge', exact: true }).click();
  await page.getByRole('heading', { name: 'Challenge published', exact: true }).waitFor();
  check(requests[2].url === undefined && requests[2].hasFile, 'Attachment-only challenges still submit');
  await page.setViewportSize({ width: 320, height: 900 });
  await go('/submit-challenge');
  await page.getByRole('textbox', { name: 'Challenge URL', exact: true }).scrollIntoViewIfNeeded();
  check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'URL input fits at 320px');
  await page.screenshot({ path: '.playwright-mcp/challenge-url-form-mobile.png' });
  await go('/challenges/' + records[0]._id);
  check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Long challenge URL wraps at 320px');
  check(errors.length === 0, 'No uncaught browser errors: ' + errors.join('; '));
  return { checks, mode: 'production frontend with mock API; multipart inspected, no real upload or database' };
}
