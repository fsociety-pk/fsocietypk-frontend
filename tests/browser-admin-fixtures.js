// Run after generated browser-fixtures.js. Every response is local fixture data.
async (page) => {
  const origin = 'http://fsociety.test';
  const state = { role: 'admin', authenticated: true, requests: [], errors: [], failStats: false };
  const admin = { _id: '507f1f77bcf86cd799439011', username: 'sheriff', role: 'admin', email: 'admin@example.invalid', avatar: '', score: 0, solvedChallenges: [], socialLinks: {}, isBanned: false, createdAt: '2025-01-01T00:00:00Z' };
  const members = [
    { ...admin, _id: '507f1f77bcf86cd799439012', username: 'cipher', email: 'cipher@example.invalid', role: 'user', createdAt: '2026-10-01T00:00:00Z' },
    { ...admin, _id: '507f1f77bcf86cd799439013', username: 'nullbyte', email: 'nullbyte@example.invalid', role: 'user', isBanned: true },
    { ...admin, _id: '507f1f77bcf86cd799439014', username: 'ayesha', email: 'ayesha@example.invalid', role: 'manager' },
  ];
  const base = { description: 'Investigate the evidence and uncover each flag in this challenge.', category: 'web', difficulty: 'easy', points: 50, hints: [{ content: 'Inspect the response headers.', cost: 0 }], attachments: [], files: [], solveCount: 8, totalFlags: 2, createdAt: '2026-10-25T12:00:00Z', createdBy: members[0], author: members[0], liveStatus: 'live' };
  const challenges = [
    { ...base, _id: '507f1f77bcf86cd799439022', title: 'The Forgotten Endpoint', status: 'pending', isActive: false },
    { ...base, _id: '507f1f77bcf86cd799439023', title: 'A Trail Through Memory', category: 'forensics', difficulty: 'medium', points: 100, status: 'pending', isActive: false },
    { ...base, _id: '507f1f77bcf86cd799439024', title: 'Signals in the Noise', category: 'crypto', status: 'approved', isActive: true },
  ];
  const writeups = [{ _id: '507f1f77bcf86cd799439031', title: 'Finding the forgotten endpoint', content: 'First inspect the HTTP response headers. Follow the redirect and inspect the hidden route.', userId: members[0], challengeId: challenges[0], status: 'pending', createdAt: base.createdAt }];
  const resources = [{ _id: '507f1f77bcf86cd799439041', title: 'A practical web security toolkit', description: 'A curated collection of tools for learning web security.', githubLink: 'https://github.com/example/toolkit', category: 'web', createdBy: members[0], isApproved: false, createdAt: base.createdAt }];
  const projects = [{ _id: '507f1f77bcf86cd799439051', title: 'Recon workspace', description: 'A focused workspace for authorized reconnaissance.', techStack: ['Python', 'React'], features: ['Reports'], websiteUrl: 'https://example.invalid', sourceCodeUrl: '' }];
  const announcements = [{ _id: '507f1f77bcf86cd799439061', title: 'A new week of challenges', message: 'New challenges are ready. Bring your curiosity.', targetRole: 'user', isActive: true, createdAt: base.createdAt }];
  const trend = Array.from({ length: 30 }, (_, i) => ({ date: `2026-10-${String(i + 1).padStart(2, '0')}`, solves: [4, 7, 3, 8, 12, 5, 9, 13, 7, 16, 10, 18, 14, 20][i % 14] }));
  page.on('pageerror', error => state.errors.push(error.message));
  await page.route('**/__admin-fixture', async route => {
    if (route.request().method() === 'POST') Object.assign(state, route.request().postDataJSON());
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(state) });
  });
  await page.route('**/api/**', async route => {
    const request = route.request(); const url = new URL(request.url()); const path = url.pathname; const method = request.method();
    const body = request.headers()['content-type']?.includes('application/json') && request.postData() ? request.postDataJSON() : {};
    state.requests.push({ path, method, query: Object.fromEntries(url.searchParams), body, role: state.role });
    const json = (data, status = 200, message = 'Admin browser fixture') => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify({ success: status < 400, data, message, statusCode: status }) });
    const current = { ...admin, role: state.role };
    if (path.endsWith('/auth/me')) return state.authenticated ? json(current) : json(null, 401, 'Not authenticated');
    if (path.endsWith('/auth/login')) { state.authenticated = true; return json({ user: current }); }
    if (path.endsWith('/auth/logout') || path.endsWith('/change-password')) { state.authenticated = false; return json(null); }
    if (path.endsWith('/admin/stats')) return state.failStats ? json(null, 503, 'Unavailable') : json({ totalUsers: 1284, totalChallenges: 42, pendingChallenges: challenges.filter(c => c.status === 'pending').length, pendingWriteups: writeups.filter(w => w.status === 'pending').length, pendingResources: resources.filter(r => !r.isApproved).length, totalSubmissions: 8742, totalProjects: projects.length, bannedUsers: 1 });
    if (path.endsWith('/admin/analytics')) return json({ overview: { totalUsers: 1284, totalChallenges: 42, totalSolves: 2065 }, userGrowth: trend.map(t => ({ date: t.date, count: Math.ceil(t.solves / 2) })), submissionTrend: trend, topChallenges: challenges.map(c => ({ title: c.title, category: c.category, solveCount: c.solveCount })), categoryStats: [{ category: 'web', count: 120 }, { category: 'crypto', count: 75 }], difficultyStats: [{ difficulty: 'easy', count: 60 }, { difficulty: 'medium', count: 35 }] });
    if (path.endsWith('/admin/users')) {
      let list = [admin, ...members].filter(u => url.searchParams.get('role') === 'all' || url.searchParams.get('role') === 'staff' ? url.searchParams.get('role') === 'all' || u.role !== 'user' : u.role === 'user');
      const search = (url.searchParams.get('search') || '').toLowerCase(); list = list.filter(u => `${u.username} ${u.email}`.includes(search));
      if (url.searchParams.get('status') !== 'all') list = list.filter(u => u.isBanned === (url.searchParams.get('status') === 'banned'));
      return json({ users: list, protectedAdminId: admin._id, pagination: { page: 1, limit: 25, total: list.length, totalPages: 1 } });
    }
    const account = members.find(u => path.includes(u._id));
    if (path.endsWith('/ban') && account) { account.isBanned = !account.isBanned; return json(account); }
    if (path.endsWith('/role') && account) { account.role = body.role; return json(account); }
    if (path.endsWith('/admin/challenges') && method === 'POST') { const challenge = { ...base, _id: '507f1f77bcf86cd799439025', title: 'Browser-created challenge', status: 'approved', isActive: true }; challenges.push(challenge); return json(challenge, 201); }
    if (path.endsWith('/admin/challenges')) return json(challenges.filter(c => !url.searchParams.get('status') || c.status === url.searchParams.get('status')));
    const challenge = challenges.find(c => path.includes('/challenges/' + c._id));
    if (challenge) { if (method === 'PATCH') Object.assign(challenge, body); if (method === 'DELETE') challenges.splice(challenges.indexOf(challenge), 1); return json(challenge); }
    if (path.endsWith('/admin/writeups')) { const list = writeups.filter(w => url.searchParams.get('status') === 'all' || w.status === url.searchParams.get('status')); return json({ writeups: list, pagination: { page: 1, pages: 1, total: list.length } }); }
    const writeup = writeups.find(w => path.includes(w._id)); if (writeup) { if (path.endsWith('/approve')) writeup.status = 'approved'; if (path.endsWith('/reject')) writeup.status = 'rejected'; return json(writeup); }
    if (path.endsWith('/admin/resources')) return json(resources.filter(r => url.searchParams.get('status') === 'all' || r.isApproved === (url.searchParams.get('status') === 'approved')));
    const resource = resources.find(r => path.includes(r._id)); if (resource) { if (path.endsWith('/approve')) resource.isApproved = true; if (method === 'DELETE') resources.splice(resources.indexOf(resource), 1); return json(resource); }
    if (path.endsWith('/projects') && method === 'GET') return json(projects);
    if (path.endsWith('/projects') && method === 'POST') { const project = { _id: '507f1f77bcf86cd799439052', ...body }; projects.push(project); return json(project, 201); }
    const project = projects.find(p => path.includes('/projects/' + p._id)); if (project) { Object.assign(project, body); return json(project); }
    if (path.endsWith('/admin/announcements') && method === 'GET') return json(announcements);
    if (path.endsWith('/admin/announcements') && method === 'POST') { const item = { _id: '507f1f77bcf86cd799439062', ...body, isActive: true, createdAt: base.createdAt }; announcements.unshift(item); return json(item, 201); }
    const announcement = announcements.find(a => path.endsWith('/announcements/' + a._id)); if (announcement) { Object.assign(announcement, body); return json(announcement); }
    if (path.endsWith('/admin-profile')) return json({ name: 'Sheriff', bio: 'Building a curious cybersecurity community.', profileImage: '', links: { github: '', linkedin: '', portfolio: '' }, socialLinks: [] });
    if (path.endsWith('/admin/system/status')) return json({ checkedAt: new Date().toISOString(), status: 'online', backend: { environment: 'production', nodeVersion: 'v22.14.0', processUptimeSeconds: 146523, rssBytes: 198180864, heapUsedBytes: 85000000 }, host: { hostname: 'ec2-backend-fixture', platform: 'linux', cpuCores: 2, loadAverage: [0.28, 0.32, 0.31], totalMemoryBytes: 4294967296, freeMemoryBytes: 2780000000, uptimeSeconds: 896523, disk: { totalBytes: 32212254720, availableBytes: 17212254720, usedPercent: 46.5 } }, database: { connected: true, latencyMs: 4 }, email: { configured: true, queue: { sent: 1284, queued: 4, failed: 1 }, workerPollSeconds: 15, maxAttempts: 5 } });
    if (path.endsWith('/admin/system/email-test')) return json({ queued: true }, 202);
    if (path.endsWith('/admin/system/email-retry')) return json({ retried: 1 });
    if (path.endsWith('/unread-count')) return json({ unreadCount: 0 });
    return json([]);
  });
  await page.evaluate(user => { localStorage.setItem('fsocietypk-auth', JSON.stringify({ state: { user, isAuthenticated: true }, version: 0 })); localStorage.setItem('fsociety-theme', 'light'); }, admin);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(origin + '/admin'); await page.waitForLoadState('networkidle');
  return { mode: 'admin API fixtures, no production traffic', url: page.url() };
}
