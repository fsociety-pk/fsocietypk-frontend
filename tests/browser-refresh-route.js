// Run after prepare-browser.cjs + browser-fixtures.js. Session responses are
// deliberately held while a DOM/history trace checks every intermediate screen.
async page => {
  const checks=[], errors=[], requests=[];
  const check=(ok,name)=>{if(!ok)throw Error(name);checks.push(name);};
  page.on('pageerror',error=>errors.push(error.message));
  const origin='http://fsociety.test';
  let authenticated=true,role='user',failure=false,release=()=>{},sessionGate=Promise.resolve();
  const hold=()=>{sessionGate=new Promise(resolve=>{release=resolve;});};
  const member=()=>({_id:'507f1f77bcf86cd799439011',username:'session_fixture',role,score:700,rank:2,isProfilePublic:true,createdAt:'2026-10-01T12:00:00Z',socialLinks:{},solvedChallenges:[],earnedBadges:[],solveHistory:[],proficiencyIndex:[],challengeProgress:[]});
  await page.addInitScript(()=>{
    window.__refreshTrace=[];
    const sample=()=>{
      const snapshot={url:location.pathname+location.search+location.hash,
        publicChrome:!!document.querySelector('.public-nav'),landing:!!document.querySelector('.cinematic-landing'),
        overview:!!document.querySelector('.overview-page'),profile:!!document.querySelector('.profile-summary'),
        login:!!document.querySelector('.access-shell'),admin:!!document.querySelector('.admin-shell')};
      const trace=window.__refreshTrace;
      if(trace.length<500 && JSON.stringify(trace.at(-1))!==JSON.stringify(snapshot))trace.push(snapshot);
    };
    new MutationObserver(sample).observe(document,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
    for(const method of ['pushState','replaceState']){
      const original=history[method];
      history[method]=function(...args){const result=original.apply(this,args);sample();return result;};
    }
    addEventListener('popstate',sample);
  });
  await page.route('**/api/**',async route=>{
    const r=route.request(),path=new URL(r.url()).pathname;
    const headers={'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Credentials':'true','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type,Authorization'};
    if(r.method()==='OPTIONS')return route.fulfill({status:204,headers});
    requests.push(path);
    const json=(data,status=200)=>route.fulfill({status,headers,contentType:'application/json',body:JSON.stringify({success:status<400,data,message:status===401?'Not authenticated':'Session fixture'})});
    if(path.endsWith('/auth/me')){const gate=sessionGate;await gate;return failure?json(null,503):authenticated?json(member()):json(null,401);}
    if(path.endsWith('/auth/login')){authenticated=true;return json({user:member()});}
    if(path.endsWith('/users/me/profile'))return json(member());
    if(path.endsWith('/notifications/unread-count'))return json({unreadCount:0});
    if(path.endsWith('/admin/stats'))return json({totalUsers:0,totalChallenges:0,totalSubmissions:0,totalProjects:0,pendingChallenges:0,pendingWriteups:0,pendingResources:0,bannedUsers:0});
    if(path.endsWith('/admin/analytics'))return json({overview:{totalUsers:0,totalChallenges:0,totalSolves:0},userGrowth:[],submissionTrend:[],topChallenges:[],categoryStats:[],difficultyStats:[]});
    return json([]);
  });
  await page.emulateMedia({reducedMotion:'reduce'});
  const pending=async path=>{
    await page.goto('about:blank');
    hold();requests.length=0;
    await page.goto(origin+path,{waitUntil:'domcontentloaded'});
    await page.getByRole('heading',{name:'Checking your session',exact:true}).waitFor();
    check(new URL(page.url()).pathname+new URL(page.url()).search+new URL(page.url()).hash===path,`${path}: session check retains the requested URL`);
    check(await page.locator('.public-nav,.app-sidebar,.cinematic-landing,.overview-page,.profile-summary,.access-shell,.admin-shell').count()===0,`${path}: no guessed layout or page renders before verification`);
    check(!requests.some(p=>p.endsWith('/users/me/profile')),`${path}: private page data waits for session verification`);
  };
  const trace=()=>page.evaluate(()=>window.__refreshTrace);
  try{
    for(const path of ['/profile','/profile?tab=badges#earned','/profile?tab=edit#photo']){
      authenticated=true;role='user';failure=false;
      await pending(path);release();await page.locator('.profile-summary').waitFor();
      const frames=await trace();
      check(frames.every(f=>!f.publicChrome && !f.landing && !f.overview && !f.login),`${path}: no public/dashboard flash during restoration`);
      check(new URL(page.url()).pathname+new URL(page.url()).search+new URL(page.url()).hash===path,`${path}: full destination survives restoration`);
      if(path.includes('badges'))check(await page.getByRole('tab',{name:'Badges',exact:true}).getAttribute('aria-selected')==='true','Restored profile keeps the selected badge tab');
      if(path.includes('edit'))check(await page.getByRole('heading',{name:'Edit profile',exact:true}).isVisible(),'Restored edit deep link opens the editor directly');
      hold();requests.length=0;await page.reload({waitUntil:'domcontentloaded'});
      await page.getByRole('heading',{name:'Checking your session',exact:true}).waitFor();
      check(await page.locator('.public-nav,.overview-page,.cinematic-landing').count()===0,`${path}: reload keeps unrelated pages unmounted`);
      release();await page.locator('.profile-summary').waitFor();
      check((await trace()).every(f=>!f.landing && !f.overview && !f.login),`${path}: reload reaches only the original member page`);
    }
    authenticated=true;await pending('/dashboard');release();await page.locator('.overview-page').waitFor();
    check((await trace()).every(f=>!f.landing && !f.publicChrome),'Member dashboard refresh never mounts the signed-out landing');
    authenticated=false;await pending('/dashboard');release();await page.locator('.cinematic-landing').waitFor();
    check((await trace()).every(f=>!f.overview),'Signed-out landing never mounts a member dashboard');
    authenticated=true;await pending('/resources');release();await page.locator('.app-sidebar').waitFor();
    check((await trace()).every(f=>!f.overview && !f.landing && !f.publicChrome),'Public resource route retains member chrome without a dashboard detour');
    authenticated=false;await pending('/signup');release();await page.getByRole('heading',{name:'Your journey starts here.',exact:true}).waitFor();
    check((await trace()).every(f=>!f.overview && !f.landing),'Direct signup waits for the session check without another page flashing');

    const destination='/profile?tab=badges#earned';
    authenticated=false;await pending(destination);release();await page.waitForURL('**/login');
    await page.getByRole('heading',{name:'Welcome back.',exact:true}).waitFor();
    check((await trace()).every(f=>!f.overview && !f.landing && !f.profile),'Expired session displays no member content before login');
    await page.getByLabel('Username or email').fill('session_fixture');
    await page.getByLabel('Password',{exact:true}).fill('FixturePassword1!');
    await page.getByRole('button',{name:'Log in',exact:true}).click();await page.locator('.profile-summary').waitFor();
    check(page.url()===origin+destination,'Logging in restores the full profile URL, tab and hash');
    check((await trace()).every(f=>!f.overview && !f.landing),'Login returns directly to the requested page without a dashboard detour');

    authenticated=false;await pending(destination);release();await page.waitForURL('**/login');
    await page.getByRole('heading',{name:'Welcome back.',exact:true}).waitFor();
    authenticated=true;hold();await page.reload({waitUntil:'domcontentloaded'});
    await page.getByRole('heading',{name:'Checking your session',exact:true}).waitFor();release();await page.locator('.profile-summary').waitFor();
    check(page.url()===origin+destination,'A session restored on the login page also retains tab and hash');
    check((await trace()).every(f=>!f.overview && !f.landing),'Already-authenticated login redirect skips the dashboard');

    let releaseChunk=()=>{},chunkRequested=false;const chunkGate=new Promise(resolve=>{releaseChunk=resolve;});
    const delayChunk=async route=>{chunkRequested=true;await chunkGate;await route.fallback();};
    await page.route(/\/assets\/Profile-[^/]+\.js$/,delayChunk);
    await pending('/profile');release();await page.waitForTimeout(150);
    check(chunkRequested,'The cold profile JavaScript request is held for the slow-load test');
    check(await page.locator('.overview-page,.cinematic-landing,.public-nav').count()===0,'A slow profile JavaScript chunk does not reveal another page');
    releaseChunk();await page.locator('.profile-summary').waitFor();await page.unroute(/\/assets\/Profile-[^/]+\.js$/,delayChunk);
    check((await trace()).every(f=>!f.overview && !f.landing),'Cold profile chunk resolves directly to the profile');

    failure=true;authenticated=true;await pending('/profile?tab=edit#photo');release();await page.waitForURL('**/login');
    await page.getByRole('heading',{name:'Welcome back.',exact:true}).waitFor();
    check((await trace()).every(f=>!f.profile && !f.overview && !f.landing),'Failed session checks do not flash protected content');
    check(errors.length===0,`No browser runtime errors: ${errors.join('; ')}`);
    return{passed:checks.length,checks};
  }catch(error){throw Error(`${error.message}\nLast successful check: ${checks.at(-1)}\nURL: ${page.url()}`);}finally{release();}
}
