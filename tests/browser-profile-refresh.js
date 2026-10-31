// Run after prepare-browser.cjs + browser-fixtures.js. All users, mutations,
// earned badges and API failures below are fixtures. No production writes.
async page => {
  const checks = [], errors = [];
  const check = (ok, name) => { if (!ok) throw Error(name); checks.push(name); };
  page.on('pageerror', error => errors.push(error.message));
  const id = '507f1f77bcf86cd799439011';
  const awards = ['web','crypto','forensics'].map((category,i) => ({ id: `${id}:${i}`, challengeId: (i+100).toString(16).padStart(24,'0'), title: ['Borrowed Badge','The Cipher Room','Memory Trail'][i], category, difficulty: 'medium', points: [300,200,200][i], earnedAt: '2026-10-20T12:00:00Z' }));
  const profile = { _id:id, username:'sheriff', role:'user', avatar:'/brand/fsociety-logo-transparent.png', bio:'Breaking down challenges. Building better instincts.', country:'PK', socialLinks:{github:'https://github.com/fsociety-pk'}, isProfilePublic:true, score:700, rank:2, createdAt:'2026-10-06T12:00:00Z', solvedChallenges:awards.map(x=>x.challengeId), earnedBadges:awards, solveHistory:awards.map(x=>({_id:x.id,challengeId:{_id:x.challengeId,title:x.title,category:x.category,difficulty:x.difficulty},isCorrect:true,pointsAwarded:x.points,timestamp:x.earnedAt})), proficiencyIndex:[{category:'web',solved:1,total:8},{category:'crypto',solved:1,total:5},{category:'forensics',solved:1,total:7}], challengeProgress:[] };
  let fail = false, privatePublic = false;
  const writes = [];
  await page.route('**/api/**', async route => {
    const r=route.request(), path=new URL(r.url()).pathname;
    const headers={'Access-Control-Allow-Origin':r.headers().origin || 'http://fsociety.test','Access-Control-Allow-Credentials':'true','Access-Control-Allow-Methods':'GET,PUT,POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type,Authorization'};
    const json=(data,status=200)=>route.fulfill({status,headers,contentType:'application/json',body:JSON.stringify({success:status<400,data,message:status===403?'This profile is private':'Local profile fixture'})});
    if(r.method()==='OPTIONS')return route.fulfill({status:204,headers});
    if(path.endsWith('/auth/me'))return json(profile);
    if(path.endsWith('/notifications/unread-count'))return json({unreadCount:0});
    if(path.endsWith('/users/me/profile')){
      if(r.method()==='PUT'){const body=r.postDataJSON();writes.push(body);Object.assign(profile,body);}
      return fail?json(null,503):json(profile);
    }
    if(path.includes('/users/') && path.endsWith('/profile'))return privatePublic?json(null,403):json(profile);
    return json([]);
  });
  await page.setViewportSize({width:1440,height:1000});
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.evaluate(()=>localStorage.setItem('fsociety-theme','light'));
  const go=async(path='/profile')=>{await page.goto('http://fsociety.test'+path);await page.locator('.profile-summary').waitFor();};
  await go();
  const name=page.locator('.profile-name');
  check(await name.getAttribute('aria-label')==='sheriff','Accessible username is stable during decoding');
  await page.waitForFunction(()=>document.querySelector('.profile-name')?.dataset.usernameState==='settled');
  check(await name.locator('[data-username-ink]').allTextContents().then(x=>x.join(''))==='sheriff','Animated username resolves to the real username');
  check(await page.locator('.profile-stat strong').allTextContents().then(x=>JSON.stringify(x)===JSON.stringify(['3','700','#2','1'])),'Statistics retain actual solves, score, rank and level');
  check(await page.getByRole('progressbar',{name:'Progress to level 2'}).getAttribute('aria-valuenow')==='700','Level progress uses actual points');
  check(await page.locator('.profile-level-console').innerText().then(x=>x.includes('300 points to level 2')),'Next-level distance is accurate');
  check(await page.locator('.profile-member-role').innerText()==='Community member','No invented member status');
  check(await page.locator('.profile-avatar img').getAttribute('src')===profile.avatar,'Existing profile photo is preserved');
  check(await page.locator('.profile-socials a').getAttribute('href')===profile.socialLinks.github,'Existing social destination is preserved');
  check((await page.locator('.profile-socials a').getAttribute('rel')).includes('noopener'),'Social links retain opener protection');
  const contrast=await page.locator('.profile-refresh').evaluate(el=>{
    const s=getComputedStyle(el), canvas=document.createElement('canvas');canvas.width=canvas.height=1;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    const luminance=token=>{ctx.fillStyle=s.getPropertyValue(token);ctx.fillRect(0,0,1,1);return [...ctx.getImageData(0,0,1,1).data].slice(0,3).map(x=>x/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4).reduce((v,x,i)=>v+x*[.2126,.7152,.0722][i],0);};
    const bg=luminance('--profile-deep');return ['--profile-paper','--profile-soft-ink','--profile-mint'].map(token=>(luminance(token)+.05)/(bg+.05));
  });
  check(contrast.every(ratio=>ratio>=4.5),'Identity heading, supporting copy and accent meet text contrast requirements');
  await page.screenshot({path:'/tmp/profile-refresh-desktop-light.png',fullPage:true});
  const widthBefore=await name.evaluate(el=>el.getBoundingClientRect().width);
  await page.getByRole('button',{name:'Replay username animation'}).click();
  await page.waitForFunction(()=>document.querySelector('.profile-name').dataset.usernameState==='decoding');
  check(await name.evaluate(el=>Math.abs(el.getBoundingClientRect().width)).then(w=>Math.abs(w-widthBefore)<.1),'Decoding reserves the final username width');
  await page.waitForFunction(()=>document.querySelector('.profile-name').dataset.usernameState==='settled');
  await page.getByRole('button',{name:'Replay username animation'}).focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  check(await page.getByRole('button',{name:'Replay username animation'}).evaluate(el=>getComputedStyle(el).outlineStyle!=='none'),'Animation replay is keyboard accessible');
  await page.getByRole('tab',{name:'Overview',exact:true}).focus();
  await page.keyboard.press('End');
  check(await page.getByRole('tab',{name:'Settings',exact:true}).getAttribute('aria-selected')==='true','End key selects Settings');
  check(await page.getByRole('tab',{name:'Settings',exact:true}).evaluate(el=>el===document.activeElement),'Keyboard selection moves tab focus');
  await page.keyboard.press('Home');
  await page.keyboard.press('ArrowRight');
  check(await page.getByRole('tab',{name:'Solve history',exact:true}).getAttribute('aria-selected')==='true','Arrow keys select solve history');
  check(await page.getByRole('table').getByRole('link',{name:'Borrowed Badge'}).isVisible(),'Solve history remains available');
  await page.getByRole('tab',{name:'Edit profile',exact:true}).click();
  await page.getByRole('textbox',{name:'Bio',exact:true}).fill('A profile edited in the isolated browser fixture.');
  await page.getByRole('button',{name:'Save changes',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('.profile-bio')?.textContent==='A profile edited in the isolated browser fixture.');
  check(writes.length===1 && writes[0].bio===profile.bio,'Profile editing saves through the existing API');
  check(profile.score===700 && profile.solvedChallenges.length===3,'Editing preserves earned progress');
  const png='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jF9sAAAAASUVORK5CYII=';
  await page.getByLabel('Upload profile photo').setInputFiles({name:'fixture.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')});
  await page.getByText('Ready to use this profile photo?').waitFor();
  await page.getByRole('button',{name:'Cancel',exact:true}).click();
  check(await page.locator('.profile-avatar img').getAttribute('src')===profile.avatar,'Photo preview cancellation restores the existing photo');
  await page.getByRole('tab',{name:'Badges',exact:true}).click();
  await page.getByRole('button',{name:'View Borrowed Badge badge',exact:true}).click();
  await page.getByRole('dialog').waitFor();
  await page.keyboard.press('Escape');
  check(await page.getByRole('dialog').count()===0,'Earned badge details still open and close');
  await page.getByRole('tab',{name:'Overview',exact:true}).click();

  for(const theme of ['light','dark']){
    await page.evaluate(theme=>{localStorage.setItem('fsociety-theme',theme);document.documentElement.dataset.theme=theme;},theme);
    for(const width of [320,390,640,768,1024,1440]){
      await page.setViewportSize({width,height:1000});
      await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
      await page.waitForTimeout(100);
      check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${theme} profile fits ${width}px`);
      check(await page.locator('.profile-avatar').isVisible(),`${theme} avatar remains visible at ${width}px`);
      if([390,1440].includes(width))await page.screenshot({path:`/tmp/profile-refresh-${width}-${theme}.png`,fullPage:true});
    }
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.reload();
  await page.locator('.profile-summary').waitFor();
  check(await name.locator('[data-username-ink]').allTextContents().then(x=>x.join(''))==='sheriff','Reduced motion shows the real username immediately');
  check(await page.locator('.profile-summary').evaluate(el=>el.getAnimations({subtree:true}).length===0),'Reduced motion disables decorative profile motion');
  await page.getByRole('tab',{name:'Edit profile',exact:true}).click();
  await page.getByRole('textbox',{name:'Username',exact:true}).fill('sh3riff');
  await page.getByRole('button',{name:'Save changes',exact:true}).click();
  await page.getByRole('heading',{name:'sh3riff',exact:true}).waitFor();
  await page.waitForFunction(()=>[...document.querySelectorAll('[data-username-ink]')].map(el=>el.textContent).join('')==='sh3riff');
  check(true,'Changing the username updates both accessible and visible text under reduced motion');
  profile.username='sheriff';await go();
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.getByRole('button',{name:'Replay username animation'}).waitFor();
  await page.getByRole('button',{name:'Replay username animation'}).click();
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.waitForFunction(()=>[...document.querySelectorAll('[data-username-ink]')].map(el=>el.textContent).join('')==='sheriff');
  check(await name.locator('[data-username-ink]').allTextContents().then(x=>x.join(''))==='sheriff','Live reduced motion immediately resolves the username');
  profile.username='researcher_with_a_very_long_name';
  profile.bio='';profile.avatar='';profile.country='';profile.socialLinks={};profile.rank=0;profile.score=0;profile.solvedChallenges=[];profile.earnedBadges=[];profile.solveHistory=[];profile.proficiencyIndex=[];
  await page.setViewportSize({width:320,height:900});await go();
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Long usernames and empty profile data fit a small phone');
  check(await page.locator('.profile-avatar').innerText()==='R','Missing photo shows the existing initial fallback');
  check(await page.locator('.profile-stat strong').allTextContents().then(x=>JSON.stringify(x)===JSON.stringify(['0','0','—','1'])),'Empty profiles keep truthful zero and unranked values');
  await page.screenshot({path:'/tmp/profile-refresh-long-empty-phone.png',fullPage:true});
  profile.isProfilePublic=false;await go();
  check(await page.locator('.profile-meta').innerText().then(x=>x.includes('Private profile')),'Private visibility is shown accurately');
  check(await page.locator('.profile-toolbar a').count()===0,'Private profiles omit the public-profile link');
  profile.username='sheriff';profile.isProfilePublic=true;profile.score=700;profile.rank=2;profile.solvedChallenges=awards.map(x=>x.challengeId);profile.earnedBadges=awards;
  await go('/profile/sheriff');
  check(await page.getByRole('heading',{name:'sheriff',exact:true}).isVisible(),'Public profile shares the polished identity panel');
  check(await page.getByRole('tablist').count()===0 && await page.getByLabel('Upload profile photo').count()===0,'Public profiles expose no private editing controls');
  privatePublic=true;await page.reload();
  await page.getByRole('heading',{name:'This profile is private'}).waitFor();
  check(true,'Private public-profile error state is preserved');
  privatePublic=false;fail=true;await page.goto('http://fsociety.test/profile');
  await page.getByRole('heading',{name:"Your profile couldn't be loaded"}).waitFor();
  check(await page.locator('.profile-summary').count()===0,'API failures show recovery instead of fabricated zero statistics');
  check(errors.length===0,`No runtime errors: ${errors.join('; ')}`);
  return {passed:checks.length,checks};
}
