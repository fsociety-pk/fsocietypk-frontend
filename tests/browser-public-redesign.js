// Run after browser-fixtures.js. Authentication and all API data are mocked.
async page => {
  await page.evaluate(async () => { await fetch('/__fixture', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ authenticated: false }) }); localStorage.removeItem('fsocietypk-auth'); });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  let checks = 0;
  for (const theme of ['light','dark']) {
    await page.evaluate(theme => localStorage.setItem('fsociety-theme', theme), theme);
    for (const path of ['/','/login','/signup','/not-a-real-route']) {
      await page.goto('http://fsociety.test'+path);
      await page.locator('h1').first().waitFor();
      for (const width of [320,768,1440]) {
        await page.setViewportSize({width,height:960});
        await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
        if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error(theme+' '+path+' overflow '+width);
        checks++;
      }
      await page.screenshot({path:`/tmp/redesign-public-${path==='/'?'landing':path.slice(1)}-${theme}.png`,fullPage:path!=='/',animations:'disabled'});
    }
  }
  return {publicAuthViewportChecks:checks};
}
