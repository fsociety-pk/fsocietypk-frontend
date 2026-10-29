// Production build + the actual ordered Vercel routes, with local API fixtures.
// Context routing also intercepts the first request from newly opened tabs.
async page => {
  const files = /* BUILD_FILES */ {};
  const config = /* VERCEL_CONFIG */ {};
  const context = page.context();
  const platform = 'http://fsociety.test';
  const about = 'https://about.fsocietypk.tech';
  const checks = [], errors = [], requests = [];
  let authenticated = true;
  const assert = (ok, message) => { if (!ok) throw Error(message); checks.push(message); };
  const resolve = url => {
    for (const rule of config.routes) {
      if (rule.handle === 'filesystem') {
        const file = files[url.pathname] || (url.pathname.endsWith('/') && files[url.pathname + 'index.html']);
        if (file) return file;
        continue;
      }
      if (rule.has?.some(condition => condition.type !== 'host' || condition.value !== url.hostname)) continue;
      const match = new RegExp(`^(?:${rule.src})$`).exec(url.pathname);
      if (match) {
        const destination = rule.dest.replace(/\$(\d+)/g, (_, index) => match[Number(index)] || '');
        return files[destination] || destination;
      }
    }
    return null;
  };
  // Include filesystem index resolution: the old root rewrite missed this case.
  assert(resolve(new URL(about)) === files['/about.html'], 'About root wins over the existing platform index');
  assert(resolve(new URL(about + '/index.html')) === files['/about.html'], 'Explicit index cannot expose the platform on the team host');
  assert(resolve(new URL(about + '/dashboard')) === files['/about.html'], 'Legacy dashboard path resolves to the team document');
  assert(resolve(new URL(platform)) === files['/index.html'], 'Main platform keeps its static root');
  assert(resolve(new URL(platform + '/admin/team')) === files['/index.html'], 'Main platform keeps admin SPA routes');
  const asset = Object.keys(files).find(file => file.startsWith('/assets/') && file.endsWith('.js'));
  assert(resolve(new URL(about + asset)) === files[asset], 'Team JavaScript assets retain filesystem routing');
  assert(resolve(new URL(about + '/api/v1/team')) === 'http://16.171.55.64:5000/api/v1/team', 'Team API proxy retains its backend destination');
  assert(resolve(new URL(platform + '/api/v1/admin/team')) === 'http://16.171.55.64:5000/api/v1/admin/team', 'Admin API proxy retains its backend destination');

  const user = { _id: '507f1f77bcf86cd799439011', username: 'routing_fixture', role: 'user', score: 0, rank: 1, solvedChallenges: [], solveHistory: [], proficiencyIndex: [] };
  const profile = { introduction: 'Local team routing fixture.', story: ['A routing test, never production team data.'], disciplines: ['Web security'], members: [], socials: [{ label: 'GitHub', detail: 'Our projects', url: 'https://github.com/fsociety-pk', kind: 'github' }] };
  const captureErrors = target => target.on('pageerror', error => errors.push(error.message));
  captureErrors(page);
  context.on('page', captureErrors);
  await page.unrouteAll({ behavior: 'wait' });
  await context.unrouteAll({ behavior: 'wait' });
  await context.route('**/*', async route => {
    const request = route.request(), url = new URL(request.url());
    const headers = { 'Access-Control-Allow-Origin': request.headers().origin || url.origin, 'Access-Control-Allow-Credentials': 'true', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Access-Control-Allow-Methods': 'GET, OPTIONS' };
    const json = (data, status = 200) => route.fulfill({ status, headers, contentType: 'application/json', body: JSON.stringify({ success: status < 400, statusCode: status, data }) });
    requests.push({ host: url.hostname, pathname: url.pathname, type: request.resourceType(), referer: request.headers().referer || '' });
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers, body: '' });
    if (url.pathname.startsWith('/socket.io/')) return route.fulfill({ status: 200, contentType: 'text/plain', body: '1' });
    if (url.pathname.startsWith('/api/v1/')) {
      if (url.pathname.endsWith('/auth/me')) return json(authenticated ? user : null, authenticated ? 200 : 401);
      if (url.pathname.endsWith('/users/me/profile')) return json(user);
      if (url.pathname.endsWith('/team/certificates')) return json({ certificates: [], years: [], pagination: { page: 1, limit: 12, total: 0, totalPages: 0 } });
      if (url.pathname.endsWith('/team')) return json(profile);
      if (url.pathname.endsWith('/notifications/unread-count')) return json({ unreadCount: 0 });
      return json([]);
    }
    if (![platform, about].includes(url.origin)) return route.fulfill({ status: 204, body: '' });
    const file = resolve(url);
    if (!file || !file.startsWith('/')) return route.fulfill({ status: 404, body: 'Missing routing fixture asset' });
    const type = { html: 'text/html', js: 'text/javascript', css: 'text/css', png: 'image/png', webp: 'image/webp', jpg: 'image/jpeg', svg: 'image/svg+xml', woff2: 'font/woff2', ttf: 'font/ttf' }[file.split('.').at(-1)] || 'application/octet-stream';
    return route.fulfill({ path: file, contentType: type });
  });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(platform + '/dashboard');
  await page.getByRole('heading', { name: 'Meet Fsociety PK' }).waitFor();
  const link = page.locator('.team-dashboard-link a');
  assert(await link.getAttribute('target') === '_blank' && (await link.getAttribute('rel')).includes('noopener'), 'Dashboard team link opens a safe new tab');
  const popupPromise = context.waitForEvent('page');
  await link.click();
  const team = await popupPromise;
  await team.waitForLoadState('domcontentloaded');
  await team.getByRole('heading', { level: 1, name: /Behind.*the flags/s }).waitFor();
  assert(page.url() === platform + '/dashboard', 'Clicking the team link preserves the dashboard tab');
  assert(team.url() === about + '/', 'New tab opens the team subdomain root');
  assert(await team.title() === 'About the team | Fsociety PK', 'New tab receives team metadata');
  assert(await team.locator('.cinematic-intro, .app-shell, .sidebar-nav').count() === 0, 'Team tab has no platform intro, shell or sidebar');
  assert(await team.locator('.team-site #ctfs, .team-site #people, .team-site #connect').count() === 3, 'Team tab contains CTF history, members and social links');
  assert(await team.locator('script[src]').evaluateAll(els => els.every(el => !el.src.includes('/assets/platform-'))), 'Team document never loads the platform entry');
  await team.waitForTimeout(4000);
  assert(team.url() === about + '/' && await team.locator('.team-site').count() === 1, 'Team remains visible beyond the intro timeout');
  const teamRequests = requests.filter(request => request.host === 'about.fsocietypk.tech' || request.referer.startsWith(about));
  assert(!teamRequests.some(request => request.pathname.endsWith('/auth/me') || request.pathname.startsWith('/socket.io/')), 'Team visit makes no session or announcement requests');
  await team.screenshot({ path: '/tmp/team-routing-desktop.png' });
  await team.reload();
  await team.locator('.team-site').waitFor();
  assert(team.url() === about + '/', 'Refreshing the team root retains the team page');
  for (const pathname of ['/dashboard', '/index.html', '/admin/team']) {
    await team.goto(about + pathname);
    await team.locator('.team-site').waitFor();
    assert(await team.locator('.app-shell, .cinematic-intro').count() === 0 && await team.title() === 'About the team | Fsociety PK', `Team hostname isolates ${pathname} from platform routes`);
  }
  await team.goto(about + '/#ctfs');
  await team.getByRole('heading', { name: 'CTFs we’ve played.' }).waitFor();
  assert(team.url().endsWith('/#ctfs'), 'Team section deep links remain available');
  for (const width of [320, 390]) {
    await team.setViewportSize({ width, height: 844 });
    await team.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    assert(await team.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Team layout fits ${width}px`);
  }
  await team.screenshot({ path: '/tmp/team-routing-phone.png' });
  await team.close();
  authenticated = false;
  await page.goto(platform + '/dashboard');
  const skip = page.getByRole('button', { name: 'Skip intro' });
  await skip.waitFor();
  await skip.click();
  const publicLink = page.locator('.public-nav').getByRole('link', { name: 'About the team', exact: true });
  const publicPopup = context.waitForEvent('page');
  await publicLink.click();
  const publicTeam = await publicPopup;
  await publicTeam.locator('.team-site').waitFor();
  assert(publicTeam.url() === about + '/' && page.url() === platform + '/dashboard', 'Public navigation also opens the team in a separate tab');
  assert(await publicTeam.locator('.cinematic-intro').count() === 0, 'First signed-out team visit has no platform intro');
  await publicTeam.close();
  assert(errors.length === 0, `No browser runtime errors: ${errors.join(', ')}`);
  await context.unrouteAll({ behavior: 'wait' });
  context.off('page', captureErrors);
  return { passed: checks.length, checks, errors, mode: 'Actual Vercel route configuration evaluated against local build files; intercepted APIs, not a live edge deployment.' };
}
