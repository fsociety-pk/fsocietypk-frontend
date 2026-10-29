// All profiles, certificates, uploads, and R2 responses below are local test fixtures.
async page => {
  const files = /* BUILD_FILES */ {};
  const origin = 'http://fsociety.test';
  const about = 'https://about.fsocietypk.tech';
  const state = { role: 'admin', requests: [], errors: [], failSave: false, failList: false };
  const profile = { version: 0, introduction: 'A local fixture for the Fsociety PK team page.', story: ['We learn, build, and solve together.'], disciplines: ['Web security', 'Forensics'], members: [], socials: [{ label: 'Discord', detail: 'Join the conversation', kind: 'discord', url: 'https://discord.gg/T92aGQn5f' }, { label: 'GitHub', detail: 'Our projects', kind: 'github', url: 'https://github.com/fsociety-pk' }] };
  const certificates = [
    { id: '507f1f77bcf86cd799439071', version: 0, title: 'Fixture CTF Autumn', eventDate: '2026-10-01', placement: 'Participation', description: 'A test certificate used only for browser verification.', eventUrl: 'https://ctf.example.invalid/autumn', isPublished: true, certificate: { name: 'autumn.png', contentType: 'image/png', size: 204800 } },
    { id: '507f1f77bcf86cd799439072', version: 0, title: 'Fixture CTF Summer', eventDate: '2025-07-10', placement: 'Finalist', description: 'A PDF certificate fixture.', eventUrl: '', isPublished: true, certificate: { name: 'summer.pdf', contentType: 'application/pdf', size: 102400 } },
    { id: '507f1f77bcf86cd799439073', version: 0, title: 'Unpublished fixture', eventDate: '2026-06-01', placement: '', description: '', eventUrl: '', isPublished: false, certificate: { name: 'draft.pdf', contentType: 'application/pdf', size: 102400 } },
  ];
  let counter = 74;
  page.on('pageerror', error => state.errors.push(error.message));
  await page.route('**/*', async route => {
    const request = route.request(); const url = new URL(request.url()); const pathname = url.pathname; const method = request.method();
    const corsHeaders = { 'Access-Control-Allow-Origin': request.headers().origin || url.origin, 'Access-Control-Allow-Credentials': 'true', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS' };
    const json = (data, status = 200, message = 'Local team fixture') => route.fulfill({ status, headers: corsHeaders, contentType: 'application/json', body: JSON.stringify({ success: status < 400, statusCode: status, message, data }) });
    if (method === 'OPTIONS' && pathname.startsWith('/api/v1/')) return route.fulfill({ status: 204, headers: corsHeaders, body: '' });
    if (pathname === '/__team_fixture') {
      if (method === 'POST') {
        const update = request.postDataJSON(); Object.assign(state, update);
        if (Number.isInteger(update.seedCount) && update.seedCount >= 1 && update.seedCount <= 24) {
          certificates.splice(0, certificates.length, ...Array.from({ length: update.seedCount }, (_, index) => ({ id: `507f1f77bcf86cd7994391${String(index).padStart(2, '0')}`, version: 0, title: `Fixture CTF ${String(index + 1).padStart(2, '0')}`, eventDate: `2026-${String(index % 12 + 1).padStart(2, '0')}-10`, placement: index % 2 ? 'Participation' : 'Finalist', description: 'A local test certificate. No real competition result is claimed.', eventUrl: 'https://ctf.example.invalid', isPublished: true, certificate: { name: `certificate-${index}.png`, contentType: 'image/png', size: 102400 } })));
        }
      }
      return json({ ...state, profile, certificates });
    }
    if (pathname.endsWith('/auth/me')) { state.requests.push({ pathname, method }); return json({ _id: '507f1f77bcf86cd799439011', username: 'fixture_admin', role: state.role, score: 0 }); }
    if (pathname.endsWith('/users/me/profile')) return json({ _id: '507f1f77bcf86cd799439011', username: 'fixture_admin', role: state.role, score: 0, solvedChallenges: [], solveHistory: [] });
    if (pathname.includes('/api/v1/') && /\/(admin\/)?team(?:\/|$)/.test(pathname)) {
      state.requests.push({ pathname, method });
      const admin = pathname.includes('/admin/');
      if (admin && state.role !== 'admin') return json(null, 403, 'Access denied');
      if (pathname.endsWith('/team')) {
        if (method === 'PUT') { if (state.failSave) { state.failSave = false; return json(null, 503, 'Fixture save failure; try again'); } Object.assign(profile, request.postDataJSON(), { version: profile.version + 1 }); }
        return json(profile);
      }
      const id = pathname.match(/certificates\/([^/]+)/)?.[1];
      if (id && pathname.endsWith('/file')) {
        const record = certificates.find(item => item.id === id && (admin || item.isPublished));
        if (!record) return json(null, 404);
        if (record.certificate.contentType === 'application/pdf') return route.fulfill({ contentType: 'application/pdf', body: '%PDF-1.4\n% local fixture\n%%EOF' });
        return route.fulfill({ contentType: 'image/svg+xml', body: `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="540" viewBox="0 0 800 540"><rect width="800" height="540" fill="#fff"/><rect x="24" y="24" width="752" height="492" fill="none" stroke="#077759" stroke-width="3"/><text x="400" y="130" text-anchor="middle" font-family="sans-serif" font-size="22" fill="#077759">FSOCIETY PK · BROWSER FIXTURE</text><text x="400" y="240" text-anchor="middle" font-family="sans-serif" font-size="40" fill="#182436">Certificate of participation</text><text x="400" y="310" text-anchor="middle" font-family="sans-serif" font-size="25" fill="#53647a">${record.title.replace(/[<>&]/g, '')}</text><text x="400" y="400" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#53647a">Test data only — no real award or result</text></svg>` });
      }
      if (method === 'POST' || method === 'PATCH') {
        if (state.failSave) { state.failSave = false; return json(null, 503, 'Fixture upload failure; your draft is preserved'); }
        const body = request.postData() || '';
        const metadata = JSON.parse(body.match(/name="data"\r\n\r\n([\s\S]*?)\r\n--/)?.[1] || '{}');
        const filename = body.match(/filename="([^"]+)"/)?.[1];
        let record = certificates.find(item => item.id === id);
        if (!record) { record = { id: '507f1f77bcf86cd7994390' + String(counter++), version: -1 }; certificates.unshift(record); }
        Object.assign(record, metadata, { version: record.version + 1 });
        if (filename) record.certificate = { name: filename, contentType: filename.endsWith('.pdf') ? 'application/pdf' : 'image/png', size: 102400 };
        return json(record, method === 'POST' ? 201 : 200);
      }
      if (method === 'DELETE') { const index = certificates.findIndex(item => item.id === id); if (index >= 0) certificates.splice(index, 1); return json(null); }
      if (state.failList) return json(null, 503, 'Fixture list failure');
      let list = certificates.filter(item => admin || item.isPublished);
      const years = [...new Set(list.map(item => Number(item.eventDate.slice(0, 4))))].sort((a, b) => b - a);
      const status = url.searchParams.get('status');
      if (admin && status && status !== 'all') list = list.filter(item => item.isPublished === (status === 'published'));
      if (url.searchParams.get('year')) list = list.filter(item => item.eventDate.startsWith(url.searchParams.get('year')));
      return json({ certificates: list, years, pagination: { page: 1, limit: 12, total: list.length, totalPages: list.length ? 1 : 0 } });
    }
    if (url.origin === about) {
      const file = files[pathname === '/' ? '/about.html' : pathname];
      if (!file) return route.fulfill({ status: 404, body: 'Unknown team fixture asset' });
      const type = { html: 'text/html', js: 'text/javascript', css: 'text/css', png: 'image/png', woff2: 'font/woff2', ttf: 'font/ttf' }[file.split('.').at(-1)] || 'application/octet-stream';
      return route.fulfill({ contentType: type, path: file });
    }
    return route.fallback();
  });
  await page.goto(origin + '/admin/team');
  await page.getByRole('heading', { name: 'About team manager', exact: true }).waitFor();
  await page.getByLabel('Introduction', { exact: true }).waitFor();
  return { mode: 'intercepted APIs and R2 responses', publicUrl: about, certificates: certificates.length };
}
