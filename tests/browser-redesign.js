// Intercepted production frontend; no real accounts, database or email.
async page => {
  const checks = [], errors = [];
  const assert = (ok, label) => { if (!ok) throw Error(label); checks.push(label); };
  page.on('pageerror', error => errors.push(error.message));
  const now = '2026-10-29T12:00:00Z', id = '507f1f77bcf86cd799439022';
  const user = { _id: '507f1f77bcf86cd799439011', username: 'cipher', role: 'user', avatar: '', bio: 'Learning through curiosity, one challenge at a time.', country: 'Pakistan', socialLinks: {}, isProfilePublic: true, score: 325, rank: 4, createdAt: now, solvedChallenges: [], proficiencyIndex: [], solveHistory: [], challengeProgress: [] };
  const challenge = { _id: id, title: 'The Forgotten Endpoint', category: 'web', difficulty: 'medium', points: 100, description: 'An abandoned service is still listening. Investigate the responses, follow the evidence, and uncover what the developer left behind.\n\nStart with the public endpoint and look carefully at the response headers.', hints: [{ _id: 'h1', content: 'Inspect the response headers.', cost: 0 }], files: [], attachments: [], solveCount: 14, totalFlags: 1, completedSequences: [], isSolved: false, status: 'approved', liveStatus: 'live', challengeUrl: 'https://example.invalid/challenge', createdAt: now, createdBy: user };
  const challenges = [challenge, { ...challenge, _id: id.slice(0,-1)+'3', title: 'Signals in the Noise', category: 'crypto', difficulty: 'easy', points: 50 }, { ...challenge, _id: id.slice(0,-1)+'4', title: 'A Trail Through Memory', category: 'forensics', difficulty: 'hard', points: 150 }];
  const writeup = { _id: '507f1f77bcf86cd799439031', title: 'Following the forgotten endpoint', content: 'Begin by inspecting the response headers. Follow the redirect to the hidden route and compare the responses.\n\nPiece together the evidence to uncover the final clue.', status: 'approved', userId: user, challengeId: challenge, createdAt: now };
  await page.route('**/api/**', async route => {
    const path = new URL(route.request().url()).pathname;
    const json = (data, meta) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data, meta, message: 'Local design fixture' }) });
    if (path.endsWith('/auth/me')) return json(user);
    if (path.endsWith('/unread-count')) return json({ unreadCount: 0 });
    if (path.endsWith('/notifications')) return json([{ _id: 'n1', title: 'Your challenge is ready', message: 'Your submission is now available to the community.', type: 'challenge_approved', read: false, createdAt: now }]);
    if (path.includes('/users/') && path.endsWith('/profile')) return json(user);
    if (path.endsWith('/leaderboard')) return json(['azerian','nullbyte','ayesha','cipher','obsidian'].map((username,i) => ({ userId: user._id.slice(0,-1)+i, username, avatar: '', score: 550-50*i, solveCount: 5, rank: i+1 })));
    if (path.endsWith('/solvers') || path.endsWith('/activity/recent') || path.endsWith('/recent-solves')) return json([]);
    if (path.includes('/writeups')) return json(path.endsWith('/'+writeup._id) ? writeup : { writeups: [writeup], pagination: { page: 1, pages: 1, total: 1 } });
    if (path.endsWith('/challenges/'+id)) return json(challenge);
    if (path.includes('/challenges')) return json(challenges);
    if (path.endsWith('/resources')) return json(['Web security field guide','Forensics essentials'].map((title,i) => ({ _id: 'r'+i, title, description: 'Practical notes, tools, and exercises for learning cybersecurity.', githubLink: 'https://example.invalid', category: i ? 'forensics' : 'web', createdBy: user, isApproved: true, createdAt: now })));
    if (path.endsWith('/projects')) return json([]);
    if (path.endsWith('/admin-profile')) return json({ name: 'Sheriff', bio: 'Building a curious cybersecurity learning community.', links: {}, socialLinks: [] });
    if (path.endsWith('/support')) return json([], { total: 0, totalPages: 1 });
    return json([]);
  });
  await page.evaluate(user => localStorage.setItem('fsocietypk-auth', JSON.stringify({ state: { user, isAuthenticated: true }, version: 0 })), user);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const routes = ['/dashboard','/challenges','/challenges/'+id,'/leaderboard','/writeups','/writeups/'+writeup._id,'/resources','/projects','/profile','/profile/cipher','/submissions','/submit-challenge','/submit-writeup','/notifications','/about-admin','/support'];
  for (const theme of ['light','dark']) {
    await page.evaluate(theme => localStorage.setItem('fsociety-theme', theme), theme);
    for (const path of routes) {
      await page.goto('http://fsociety.test'+path);
      await page.locator('main h1').first().waitFor();
      assert((await page.locator('main').innerText()).length > 30, `${theme} ${path}: content`);
      for (const width of [320,768,1440]) {
        await page.setViewportSize({ width, height: 960 });
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${theme} ${path}: fits ${width}`);
      }
      if (['/dashboard','/challenges','/challenges/'+id,'/resources','/profile','/support'].includes(path)) await page.screenshot({ path: `/tmp/redesign-${path.includes(id) ? 'challenge-detail' : path.slice(1)}-${theme}.png`, fullPage: true, animations: 'disabled' });
    }
  }
  await page.goto('http://fsociety.test/challenges');
  const card = page.locator('.challenge-card').first();
  await card.waitFor();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await card.hover({ position: { x: 30, y: 35 } });
  await page.waitForTimeout(300);
  assert(await card.getAttribute('data-surface-active') !== null, 'Shared 3D hover activates');
  assert(await card.evaluate(el => !!el.style.getPropertyValue('--surface-rx')), 'Pointer drives perspective tilt');
  await page.mouse.move(10,10);
  assert(await card.getAttribute('data-surface-active') === null, 'Pointer exit resets card');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await card.hover();
  assert(await card.evaluate(el => getComputedStyle(el).transform === 'none'), 'Reduced motion disables transforms');
  assert(!errors.length, 'No page errors: '+errors.join('; '));
  return { checks: checks.length, results: checks };
}
