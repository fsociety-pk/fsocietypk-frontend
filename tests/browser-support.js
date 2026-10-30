// Run after prepared browser-fixtures.js. All APIs intercepted; no messages sent.
async (page) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  let role = 'user', failCreate = true, failClose = true;
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
        const input = request.postDataJSON();
        if (input.status === 'closed' && failClose) return json(null, 503, 'Your ticket could not be closed. Please try again.');
        if (input.status) ticket.status = input.status;
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
  await page.getByRole('button', { name: 'New ticket', exact: true }).click();
  if (!await page.getByLabel('Subject', { exact: true }).evaluate(el => document.activeElement === el)) throw Error('New ticket did not focus the form');
  await page.getByRole('button', { name: 'Send ticket', exact: true }).click();
  await page.getByText('Enter a subject with at least 5 characters.', { exact: true }).waitFor();
  await page.getByText('Describe your request in at least 10 characters.', { exact: true }).waitFor();
  await page.getByLabel('Subject', { exact: true }).fill('Challenge download fails');
  await page.getByLabel('Your message', { exact: true }).fill('Clicking the download button shows a blank page.');
  await page.getByRole('button', { name: 'Send ticket', exact: true }).click();
  await page.getByRole('alert').filter({ hasText: 'Please try again' }).waitFor();
  if (await page.getByLabel('Your message', { exact: true }).inputValue() !== 'Clicking the download button shows a blank page.') throw Error('Draft lost on failure');
  failCreate = false;
  await page.getByRole('button', { name: 'Send ticket', exact: true }).click();
  await page.getByRole('heading', { name: 'Challenge download fails' }).waitFor();
  await page.getByRole('button', { name: 'New ticket', exact: true }).click();
  if (!await page.getByLabel('Subject', { exact: true }).evaluate(el => document.activeElement === el)) throw Error('New ticket from a conversation did not focus the form');
  await page.getByRole('button', { name: /Challenge download fails/ }).click();
  await page.getByLabel('Add a reply').fill('This happens in Firefox too.');
  await page.getByRole('button', { name: 'Send reply', exact: true }).click();
  await page.getByText('This happens in Firefox too.', { exact: true }).waitFor();
  role = 'admin';
  await page.goto('http://fsociety.test/admin/support?ticket=' + ticket._id);
  await page.getByLabel('Reply to the member').fill('Thanks for reporting this. The download is fixed.');
  await page.getByRole('button', { name: 'Send reply', exact: true }).click();
  await page.getByText('Thanks for reporting this. The download is fixed.', { exact: true }).waitFor();
  if (await page.getByRole('button', { name: 'Close ticket', exact: true }).count()) throw Error('Admin can close a member ticket');
  if (await page.getByLabel('Ticket status', { exact: true }).locator('option[value="closed"]').count()) throw Error('Admin status picker offers user-only closure');
  await page.getByLabel('Ticket status', { exact: true }).selectOption('resolved');
  await page.getByText('This ticket is resolved.', { exact: true }).waitFor();
  await page.getByLabel('Ticket status', { exact: true }).selectOption('open');
  await page.getByLabel('Reply to the member').waitFor();
  await page.screenshot({ path: '/tmp/support-admin-desktop.png', fullPage: true });
  await page.getByLabel('Ticket status', { exact: true }).selectOption('resolved');
  await page.getByText('This ticket is resolved.', { exact: true }).waitFor();
  role = 'user';
  await page.goto('http://fsociety.test/support?ticket=' + ticket._id);
  await page.getByText('This ticket is resolved.', { exact: true }).waitFor();
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 950 });
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw Error(`Close ticket layout overflows at ${width}`);
    if (!await page.getByRole('button', { name: 'Close ticket', exact: true }).isVisible()) throw Error(`Close ticket is not visible at ${width}`);
  }
  await page.getByRole('button', { name: 'Close ticket', exact: true }).click();
  await page.getByText('Your ticket could not be closed. Please try again.', { exact: true }).waitFor();
  if (await page.getByText('This ticket is closed.', { exact: true }).count()) throw Error('Failed close incorrectly marked ticket closed');
  failClose = false;
  await page.getByRole('button', { name: 'Close ticket', exact: true }).click();
  await page.getByText('This ticket is closed.', { exact: true }).waitFor();
  if (await page.getByRole('button', { name: 'Close ticket', exact: true }).count() || await page.getByLabel('Add a reply').count()) throw Error('Closed member ticket is still writable');
  await page.getByText('Thanks for reporting this. The download is fixed.', { exact: true }).waitFor();
  await page.reload();
  await page.getByText('This ticket is closed.', { exact: true }).waitFor();
  await page.screenshot({ path: '/tmp/support-owner-closed.png', fullPage: true });
  role = 'admin';
  await page.goto('http://fsociety.test/admin/support?ticket=' + ticket._id);
  await page.getByText('The member closed this ticket. The conversation is read-only.', { exact: true }).waitFor();
  if (await page.getByLabel('Ticket status', { exact: true }).count() || await page.getByLabel('Reply to the member').count()) throw Error('Admin can change or reply to a closed ticket');
  role = 'user';
  await page.goto('http://fsociety.test/support');
  await page.getByRole('heading', { name: 'Let’s sort it out.' }).waitFor();
  await page.getByLabel('Filter tickets by status').selectOption('closed');
  await page.getByRole('button', { name: /Challenge download fails/ }).waitFor();
  for (const width of [320, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 950 });
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw Error(`Overflow at ${width}`);
  }
  await page.setViewportSize({ width: 320, height: 950 });
  await page.screenshot({ path: '/tmp/support-mobile.png', fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: '/tmp/support-desktop.png', fullPage: true });
  if (errors.length) throw Error(errors.join('\n'));
  return 'PASS ticket creation/replies/resolve/reopen, owner-only Close ticket, close failure/retry, saved history after reload, closed read-only for member/admin, Closed filter, responsive widths 320/768/1024/1440, no page errors';
}
