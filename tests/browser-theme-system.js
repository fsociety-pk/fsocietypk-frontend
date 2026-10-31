// Run after prepare-browser.cjs and generated browser-fixtures.js.
// Production assets, mocked API responses; no live accounts or data writes.
async page => {
  const checks = [], reports = [];
  const check = (ok, label) => { if (!ok) throw Error(label); checks.push(label); };
  const origin = 'http://fsociety.test';
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.evaluate(async () => fetch('/__fixture', { method: 'POST', body: JSON.stringify({ authenticated: false }) }));
  await page.route('**/api/**', route => {
    const request = route.request();
    if (!new URL(request.url()).pathname.endsWith('/resources') || request.method() !== 'GET') return route.fallback();
    const data = ['web', 'crypto', 'forensics', 'pwn', 'osint', 'reverse-engineering', 'tools'].map((category, i) => ({
      _id: `theme-resource-${i}`, title: `Theme fixture: ${category}`, description: 'Browser fixture for resource category and action contrast.',
      category, githubLink: 'https://example.invalid', createdBy: { _id: 'theme-member', username: 'fixture' }, isApproved: true,
    }));
    return route.fulfill({ contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Credentials': 'true' }, body: JSON.stringify({ success: true, data }) });
  });
  const setTheme = async theme => page.evaluate(theme => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('fsociety-theme', theme);
    window.dispatchEvent(new Event('fsociety-theme-change'));
  }, theme);
  const audit = async () => page.evaluate(() => {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const rgba = color => { ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = color; ctx.fillRect(0, 0, 1, 1); return [...ctx.getImageData(0, 0, 1, 1).data].map((x, i) => i === 3 ? x / 255 : x); };
    const over = (fg, bg) => fg.slice(0, 3).map((x, i) => x * fg[3] + bg[i] * (1 - fg[3])).concat(1);
    const luminance = color => color.slice(0, 3).map(x => x / 255).map(x => x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4).reduce((v, x, i) => v + x * [.2126, .7152, .0722][i], 0);
    const failures = []; let sampled = 0; let minimum = 21;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode, el = node.parentElement;
      if (!node.textContent.trim() || !el || !el.getClientRects().length || el.closest('script,style,svg,[aria-hidden="true"],button:disabled,[aria-disabled="true"]')) continue;
      const style = getComputedStyle(el);
      if (style.visibility !== 'visible') continue;
      let opacity = 1, bg = [255, 255, 255, 1];
      const ancestors = []; for (let a = el; a; a = a.parentElement) ancestors.unshift(a);
      for (const a of ancestors) { const s = getComputedStyle(a); opacity *= Number(s.opacity); bg = over(rgba(s.backgroundColor), bg); }
      if (opacity < .1) continue;
      const link = el.closest('.public-nav a');
      if (link?.querySelector('.public-nav-highlight')) bg = over(rgba(getComputedStyle(link.querySelector('.public-nav-highlight')).backgroundColor), bg);
      if (el.closest('.auth-switch a.selected')) bg = over(rgba(getComputedStyle(el.closest('.auth-switch').querySelector(':scope > span')).backgroundColor), bg);
      const fg = rgba(style.color); fg[3] *= opacity;
      const a = luminance(over(fg, bg)), b = luminance(bg), ratio = (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
      const large = parseFloat(style.fontSize) >= 24 || (parseFloat(style.fontSize) >= 18.66 && Number(style.fontWeight) >= 700);
      const required = large ? 3 : 4.5;
      sampled++; minimum = Math.min(minimum, ratio);
      if (ratio < required - .02) failures.push({ text: node.textContent.trim().slice(0, 65), class: el.className, ratio: +ratio.toFixed(2), required });
    }
    return { sampled, minimum: +minimum.toFixed(2), failures };
  });
  for (const authenticated of [false, true]) {
    await page.evaluate(authenticated => fetch('/__fixture', { method: 'POST', body: JSON.stringify({ authenticated }) }), authenticated);
    const routes = authenticated ? ['/dashboard', '/challenges', '/leaderboard', '/profile'] : ['/dashboard', '/resources', '/projects', '/login', '/signup'];
    for (const route of routes) {
      await page.goto(origin + route); await page.waitForLoadState('networkidle');
      await page.locator('main').waitFor();
      for (const theme of ['light', 'dark']) {
        await setTheme(theme);
        await page.mouse.move(0, 0);
        await page.waitForTimeout(100);
        const report = await audit();
        reports.push({ route, authenticated, theme, ...report });
      }
    }
  }
  for (const report of reports) check(!report.failures.length, `${report.authenticated ? 'Member' : 'Public'} ${report.route} ${report.theme}: text contrast (${JSON.stringify(report.failures)})`);
  await page.evaluate(() => fetch('/__fixture', { method: 'POST', body: JSON.stringify({ authenticated: false }) }));
  await page.goto(origin + '/dashboard');
  await page.locator('.public-nav').waitFor();
  await setTheme('light');
  const labels = ['Home', 'Challenges', 'Resources', 'Projects', 'About the team'];
  check(JSON.stringify(await page.locator('.public-nav > a').allTextContents()) === JSON.stringify(labels), 'Desktop uses the approved link sequence');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.locator('.public-nav a').filter({ hasText: 'Resources' }).hover();
  await page.waitForTimeout(280);
  check(await page.locator('.public-nav a').filter({ hasText: 'Resources' }).locator('.public-nav-highlight').count() === 1, 'Hover moves the shared highlight');
  await page.locator('.public-nav a').filter({ hasText: 'Projects' }).focus();
  check(await page.locator('.public-nav a').filter({ hasText: 'Projects' }).locator('.public-nav-highlight').count() === 1, 'Keyboard focus moves the highlight');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  check(await page.locator('.public-site-header').evaluate(el => el.getAnimations().length === 0), 'Reduced motion removes the navigation entrance');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Open navigation' }).click();
  check(JSON.stringify(await page.locator('.public-mobile-drawer nav > a').allTextContents()) === JSON.stringify(labels), 'Mobile uses the same approved link sequence');
  const close = page.getByRole('button', { name: 'Close navigation', exact: true }).last();
  await close.focus(); await page.keyboard.press('Shift+Tab');
  check(await page.locator('.mobile-drawer-footer a').last().evaluate(el => el === document.activeElement), 'Mobile keyboard focus remains within the dialog');
  await page.keyboard.press('Escape');
  check(await page.getByRole('button', { name: 'Open navigation' }).evaluate(el => el === document.activeElement), 'Escape restores menu focus');
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.locator('.public-mobile-drawer').getByRole('link', { name: 'Home', exact: true }).click();
  check(await page.locator('.public-mobile-drawer').count() === 0, 'Selecting the current page also closes the menu');
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(100);
  check(await page.evaluate(() => !document.querySelector('.public-mobile-drawer') && document.body.style.overflow !== 'hidden'), 'Desktop resizing dismisses the menu and restores scrolling');
  return { passed: checks.length, sampled: reports.reduce((n, r) => n + r.sampled, 0), checks, reports };
}
