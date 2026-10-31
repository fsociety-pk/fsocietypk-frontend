// Run after prepare-browser.cjs + browser-fixtures.js. Account/OTP calls are
// intercepted. Test passwords are local fixtures; no production registration.
async page => {
  const checks=[];
  const check=(ok,label)=>{if(!ok)throw Error(label);checks.push(label);};
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.setViewportSize({width:1440,height:900});
  await page.evaluate(async()=>{sessionStorage.clear();localStorage.setItem('fsociety-theme','light');await fetch('/__fixture',{method:'POST',body:JSON.stringify({authenticated:false})});});
  await page.goto('http://fsociety.test/signup');
  const robot=page.locator('.password-strength-robot'), password=page.getByLabel('Password',{exact:true}), crew=page.locator('.cartoon-crew');
  await robot.waitFor();
  check(await robot.getAttribute('data-strength')==='empty','Signup robot starts in a neutral waiting state');
  check(await page.locator('.companion').count()===3,'Original three privacy companions remain');
  const expressions=()=>page.locator('.companion-mouth').evaluateAll(els=>JSON.stringify(els.map(el=>{const s=getComputedStyle(el);return[s.transform,s.width,s.height,s.backgroundColor];})));
  await password.fill('a');
  const baseline=await expressions();
  const cases=[['a','weak',1],['abcdefghA','fair',3],['abcdefghA1','good',4],['abcdefghA1!','complete',5],['ValidPass1!'+'é'.repeat(32),'invalid',5]];
  const mouths=[];
  for(const [value,state,passed] of cases){
    await password.fill(value);
    check(await robot.getAttribute('data-strength')===state,`Robot reacts to ${state} password checks`);
    check(await crew.getAttribute('data-emotion')==='neutral' && await expressions()===baseline,`Crew expression is independent of ${state} password checks`);
    check(await page.locator('.companion-green').evaluate(el=>parseFloat(el.style.getPropertyValue('--look-y'))<0),`Crew keeps its eyes up for ${state} masked entry`);
    check(await page.locator('.password-checker li.met').count()===passed,`${state} robot preserves the existing rule checker`);
    mouths.push(await page.locator('.password-robot-mouth').getAttribute('d'));
  }
  check(new Set(mouths).size>=4,'Robot has distinct worried, neutral and smiling expressions');
  check((await robot.getAttribute('aria-label')).includes('72-byte'),'Overlong multibyte passwords show the invalid state even when five rules pass');
  check(await password.getAttribute('aria-invalid')==='true','The existing byte-limit validation remains active');
  await password.fill('abcdefghA1!');
  const placement=await page.evaluate(()=>{const input=document.querySelector('#auth-password').getBoundingClientRect(),r=document.querySelector('.password-strength-robot').getBoundingClientRect();return r.left>input.right && Math.abs(r.y+r.height/2-input.y-input.height/2)<1;});
  check(placement,'Robot sits beside the password input without overlapping its visibility control');
  await page.screenshot({path:'/tmp/signup-password-robot-desktop.png',fullPage:true});
  await page.getByRole('button',{name:'Show password',exact:true}).click();
  check(await crew.getAttribute('class').then(x=>x.includes('is-covered')),'Revealed passwords retain the crew privacy pose');
  await page.waitForFunction(()=>document.querySelector('.crew-privacy-arms').dataset.progress==='1');
  check(await robot.getAttribute('data-strength')==='complete','Password visibility does not override the robot reaction');
  await password.fill('a');
  check(await robot.getAttribute('data-strength')==='weak' && await expressions()===baseline,'Robot alone reacts while the crew protects a revealed password');
  await page.getByRole('button',{name:'Hide password',exact:true}).click();
  await password.focus();
  check((await page.locator('.companion-bubble').innerText()).includes('Eyes up'),'Crew message explains password privacy');
  await password.fill('');
  check(await robot.getAttribute('data-strength')==='empty','Clearing resets the robot');
  await page.emulateMedia({reducedMotion:'no-preference'});
  await password.fill('a');
  check(await robot.locator('svg').evaluate(el=>getComputedStyle(el).animationName==='password-robot-react'),'Robot uses a short reaction on checker-state changes');
  await page.emulateMedia({reducedMotion:'reduce'});
  check(await robot.evaluate(el=>el.getAnimations({subtree:true}).length===0),'Reduced motion keeps the robot expression without movement');
  for(const theme of ['light','dark']){
    await page.evaluate(theme=>{document.documentElement.dataset.theme=theme;},theme);
    for(const [width,height] of [[320,568],[390,844],[768,1024],[1440,768]]){
      await page.setViewportSize({width,height});
      await password.fill('abcdefghA1!');
      await password.scrollIntoViewIfNeeded();
      check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${theme} signup fits ${width}×${height}`);
      const box=await robot.boundingBox(),input=await password.boundingBox();
      check(box.x>=input.x+input.width && box.x+box.width<=width,`${theme} robot stays beside the field at ${width}px`);
      await page.getByRole('button',{name:'Create account',exact:true}).scrollIntoViewIfNeeded();
      check(await page.getByRole('button',{name:'Create account',exact:true}).isVisible(),`${theme} signup submit remains reachable at ${width}px`);
      if(width===390)await page.screenshot({path:`/tmp/signup-password-robot-phone-${theme}.png`,fullPage:true});
    }
  }
  await page.goto('http://fsociety.test/login');
  await page.getByLabel('Password',{exact:true}).fill('a');
  check(await page.locator('.password-strength-robot,.password-checker').count()===0,'Login does not display a signup strength checker');
  check(await page.locator('.cartoon-crew.is-private').count()===1,'Login retains the eyes-up privacy pose');
  const loginExpression=await expressions();
  await page.getByLabel('Password',{exact:true}).fill('abcdefghA1!');
  check(await expressions()===loginExpression && await crew.getAttribute('data-emotion')==='neutral','Login crew does not judge password strength');
  const fixture=await page.evaluate(async()=>(await(await fetch('/__fixture')).json()).data);
  check(!fixture.requests.some(r=>/\/auth\/(login|register)$/.test(r.path)),'Typing and reacting send no credential requests');
  check(fixture.errors.length===0,'No browser runtime errors');
  return{passed:checks.length,checks};
}
