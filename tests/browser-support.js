// Run after prepared browser-fixtures.js. All APIs intercepted; no messages sent.
async (page) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  let role = 'user', failCreate = true;
  let ticket;
  const now = new Date().toISOString();
  const user = () => ({ _id: '507f1f77bcf86cd799439011', username: 'cipher', role, score: 0, solvedChallenges: [] });
  await page.route('**/api/**', async route => {
    const request = route.request(), path = new URL(request.url()).pathname;
    const json = (data, status = 200, message = 'OK', meta) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify({ success: status < 400, data, message, meta }) });
    if (path.endsWith('/auth/me')) return json(user());
    if (path.includes('/support')) {
      if (request.method() === 'POST') {
        if (failCreate) return json(null, 503, 'Please try again shortly.');
        const input = request.postDataJSON();
        ticket = { _id: '507f1f77bcf86cd799439022', subject: input.subject, category: input.category, status: 'open', userId: user(), createdAt: now, updatedAt: now, messages: [{ _id: 'm1', author: 'member', body: input.message, createdAt: now }] };
        return json(ticket, 201);
      }
      if (request.method() === 'PATCH') {
        const input = request.postDataJSON(); if (input.status) ticket.status = input.status;
        if (input.message) ticket.messages.push({ _id: `m${ticket.messages.length + 1}`, author: role === 'admin' ? 'admin' : 'member', body: input.message, createdAt: now });
        return json(ticket);
      }
      if (path.endsWith('/support')) return json(ticket ? [ticket] : [], 200, 'OK', { total: ticket ? 1 : 0, totalPages: 1 });
      return json(ticket);
    }
    if (path.endsWith('/unread-count')) return json({ unreadCount: 0 });
    return json([]);
  });
  await page.evaluate(value => localStorage.setItem('fsocietypk-auth', JSON.stringify({ state: { user: value, isAuthenticated: true }, version: 0 })), user());
  await page.goto('http://fsociety.test/support');
  await page.getByRole('heading', { name: 'Let’s sort it out.' }).waitFor();
  await page.getByLabel('Subject', { exact: true }).fill('Challenge download fails');
  await page.getByLabel('Your message', { exact: true }).fill('Clicking the download button shows a blank page.');
  await page.getByRole('button', { name: 'Send ticket', exact: true }).click();
  await page.getByRole('alert').filter({ hasText: 'Please try again' }).waitFor();
  if (await page.getByLabel('Your message', { exact: true }).inputValue() !== 'Clicking the download button shows a blank page.') throw Error('Draft lost on failure');
  failCreate = false;
  await page.getByRole('button', { name: 'Send ticket', exact: true }).click();
  await page.getByRole('heading', { name: 'Challenge download fails' }).waitFor();
  await page.getByLabel('Add a reply').fill('This happens in Firefox too.');
  await page.getByRole('button', { name: 'Send reply', exact: true }).click();
  await page.getByText('This happens in Firefox too.', { exact: true }).waitFor();
  role = 'admin';
  await page.goto('http://fsociety.test/admin/support?ticket=' + ticket._id);
  await page.getByLabel('Reply to the member').fill('Thanks for reporting this. The download is fixed.');
  await page.getByRole('button', { name: 'Send reply', exact: true }).click();
  await page.getByText('Thanks for reporting this. The download is fixed.', { exact: true }).waitFor();
  await page.getByLabel('Ticket status', { exact: true }).selectOption('resolved');
  await page.getByText('This ticket is resolved.', { exact: true }).waitFor();
  await page.getByLabel('Ticket status', { exact: true }).selectOption('open');
  await page.getByLabel('Reply to the member').waitFor();
  await page.screenshot({ path: '/tmp/support-admin-desktop.png', fullPage: true });
  role = 'user';
  await page.goto('http://fsociety.test/support');
  await page.getByRole('heading', { name: 'Let’s sort it out.' }).waitFor();
  for (const width of [320, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 950 });
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw Error(`Overflow at ${width}`);
  }
  await page.setViewportSize({ width: 320, height: 950 });
  await page.screenshot({ path: '/tmp/support-mobile.png', fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: '/tmp/support-desktop.png', fullPage: true });
  if (errors.length) throw Error(errors.join('\n'));
  return 'PASS empty state, draft preservation on failure, create, member reply, admin reply, resolve/reopen, responsive widths 320/768/1024/1440, no page errors';
}
