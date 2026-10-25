// Run with the connected Playwright browser_run_code tool after prepare-browser.cjs.
// All HTTP requests are intercepted. API results are fixtures, never a real database.
async (page) => {
  const files = /* BUILD_FILES */ {};
  const origin = 'http://fsociety.test';
  await page.unrouteAll({ behavior: 'wait' });
  const state = { authenticated: false, requests: [], errors: [] };
  const challenge = { _id: '507f1f77bcf86cd799439022', title: 'The Forgotten Archive', category: 'web', difficulty: 'easy', points: 50, description: 'A local browser fixture.', hints: [], files: [], attachments: [], solveCount: 5, isSolved: true, completedAt: '2025-01-02T12:00:00.000Z', createdAt: '2025-01-01T00:00:00Z' };
  const profile = { _id: '507f1f77bcf86cd799439011', username: 'obsidian', role: 'admin', avatar: '', bio: 'Local browser fixture', country: 'Pakistan', socialLinks: {}, isProfilePublic: true, score: 325, rank: 4, createdAt: '2025-01-01T00:00:00Z', solvedChallenges: Array.from({ length: 5 }, (_, i) => ({ ...challenge, _id: challenge._id.slice(0, -1) + i })), proficiencyIndex: [], solveHistory: [{ _id: 'solve-fixture', challengeId: challenge, isCorrect: true, pointsAwarded: 50, timestamp: challenge.completedAt }] };
  const ranks = ['azerian', 'kachy_ka_daku', 'abdullah', 'obsidian', 'cipher'].map((username, i) => ({ userId: `fixture-${i}`, username, avatar: '', score: 550 - i * 75, solveCount: 5, rank: i + 1 }));
  page.on('pageerror', error => state.errors.push(error.message));
  await page.route('**/*', async route => {
    const request = route.request();
    const url = new URL(request.url());
    const pathname = url.pathname;
    const json = (data, status = 200, message = 'Local browser fixture') => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify({ success: status < 400, statusCode: status, message, data }) });
    if (url.origin !== origin) return route.fulfill({ status: 204, body: '' });
    if (pathname === '/__fixture') {
      if (request.method() === 'POST') Object.assign(state, request.postDataJSON());
      return json({ ...state, avatar: profile.avatar });
    }
    if (pathname.startsWith('/socket.io/')) return route.fulfill({ status: 200, contentType: 'text/plain', body: '1' });
    if (pathname.startsWith('/api/')) {
      const body = request.postData() ? request.postDataJSON() : null;
      state.requests.push({ path: pathname, search: url.search, method: request.method(), body });
      if (pathname.endsWith('/auth/me')) return state.authenticated ? json(profile) : json(null, 401, 'Not authenticated');
      if (pathname.endsWith('/auth/register')) return json({ registrationId: 'a'.repeat(64), expiresIn: 600, retryAfter: 60 }, 202);
      if (pathname.endsWith('/auth/verify-email')) {
        if (body.code !== '123456') return json(null, 400, 'That code is incorrect, expired or used.');
        state.authenticated = true;
        return json({ user: profile }, 201);
      }
      if (pathname.endsWith('/auth/resend-otp')) return json({ expiresIn: 600, retryAfter: 60 });
      if (pathname.endsWith('/auth/login')) { state.authenticated = true; return json({ user: profile }); }
      if (pathname.endsWith('/auth/logout')) { state.authenticated = false; return json(null); }
      if (pathname.endsWith('/change-password')) { state.authenticated = false; return json(null); }
      if (pathname.endsWith('/users/me/profile')) { if (body) Object.assign(profile, body); return json(profile); }
      if (pathname.endsWith('/leaderboard')) return json(ranks);
      if (pathname.endsWith('/notifications/unread-count')) return json({ unreadCount: 0 });
      if (pathname.endsWith('/challenges/' + challenge._id)) return json(challenge);
      if (pathname.endsWith('/solvers')) return json([]);
      if (pathname.endsWith('/challenges')) return json([challenge]);
      return json([]);
    }
    const file = files[pathname] || (!pathname.split('/').at(-1).includes('.') ? files['/index.html'] : null);
    if (!file) return route.fulfill({ status: 404, body: 'Unknown fixture asset' });
    const ext = file.split('.').at(-1);
    const mime = { html: 'text/html', js: 'text/javascript', css: 'text/css', png: 'image/png', jpg: 'image/jpeg', svg: 'image/svg+xml', woff2: 'font/woff2', woff: 'font/woff', ico: 'image/x-icon' }[ext] || 'application/octet-stream';
    await route.fulfill({ status: 200, contentType: mime, path: file });
  });
  await page.goto(origin + '/signup');
  await page.waitForLoadState('networkidle');
  await page.getByRole('heading', { name: 'Join the collective.' }).waitFor();
  return { mode: 'intercepted production build and mock API', files: Object.keys(files).length, url: page.url() };
}
