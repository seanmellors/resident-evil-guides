/* Basic consent mode: the Google library is never fetched without opt-in. */
(() => {
  'use strict';
  const ID = 'G-H3CMPEQNXD';
  const KEY = 're2-cookie-consent-v1';
  const AGE = 180 * 24 * 60 * 60 * 1000;
  let loaded = false;
  let lastFocus;
  window['ga-disable-' + ID] = true;
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  gtag('consent', 'default', {analytics_storage:'denied', ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied'});
  function read() {
    try {
      const c = JSON.parse(localStorage.getItem(KEY));
      if (c && c.version === 1 && typeof c.analytics === 'boolean' && Number.isFinite(c.time) && c.time <= Date.now() && Date.now() - c.time < AGE) return c;
    } catch (_) { /* Storage failure must never enable tracking. */ }
    return null;
  }
  function clearAnalyticsCookies() {
    const domains = [null];
    const parts = location.hostname.split('.');
    for(let i=0;i<parts.length-1;i++) domains.push('.'+parts.slice(i).join('.'));
    const paths = new Set(['/']);
    const seg = location.pathname.split('/'); seg.pop();
    while(seg.length) { paths.add(seg.join('/') || '/'); paths.add((seg.join('/') || '')+'/'); seg.pop(); }
    document.cookie.split(';').forEach(pair => {
      const name = pair.split('=')[0].trim();
      if (!/^(_ga(?:_|$)|_gid$|_gat(?:_|$))/.test(name)) return;
      for(const domain of domains) for(const path of paths)
        document.cookie = name+'=; Max-Age=0; path='+path+(domain?'; domain='+domain:'')+'; SameSite=Lax';
    });
  }
  function apply(allowed) {
    window['ga-disable-' + ID] = !allowed;
    if (!allowed) { clearAnalyticsCookies(); return; }
    if (loaded) return;
    loaded = true;
    gtag('consent','update',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
    gtag('js',new Date());
    gtag('config',ID,{allow_google_signals:false,allow_ad_personalization_signals:false,cookie_expires:15552000,cookie_update:false});
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id='+ID;
    document.head.appendChild(script);
  }
  const panel = document.createElement('section');
  panel.id='cookie-panel'; panel.className='cookie-panel';
  panel.setAttribute('role','region'); panel.setAttribute('aria-labelledby','cookie-title');
  panel.innerHTML = `<h2 id="cookie-title">Your cookie choices</h2>
    <p>We use essential storage to remember your choice. With your permission, Google Analytics helps us understand how these guides are used. Analytics stays off unless you accept. <a href="privacy.html">Read our privacy &amp; cookie policy</a>.</p>
    <div class="cookie-actions"><button type="button" data-choice="yes">Accept analytics</button><button type="button" data-choice="no">Reject analytics</button></div>
    <p class="cookie-note">You can change your choice at any time using Cookie settings in the footer.</p>`;
  document.body.appendChild(panel);
  const status = document.createElement('p'); status.className='consent-status'; status.setAttribute('role','status'); document.body.appendChild(status);
  function open() {lastFocus=document.activeElement; panel.hidden=false; panel.querySelector('button').focus();}
  panel.querySelectorAll('[data-choice]').forEach(button=>button.addEventListener('click',()=>{
    const allowed=button.dataset.choice==='yes';
    let saved=true;
    try {localStorage.setItem(KEY,JSON.stringify({version:1,analytics:allowed,time:Date.now()}));} catch (_) {saved=false;}
    // A reload unloads Google's library and any pending automatic event listeners after withdrawal.
    const reload = loaded && !allowed;
    apply(allowed); panel.hidden=true;
    status.textContent=(allowed?'Analytics accepted.':'Analytics rejected.')+(saved?'':' Your browser could not save this choice; you may be asked again on another page.');
    if(lastFocus && lastFocus.isConnected) lastFocus.focus();
    if(reload && saved) location.reload();
  }));
  document.querySelectorAll('[data-cookie-settings]').forEach(b=>b.addEventListener('click',open));
  const choice=read(); panel.hidden=!!choice; apply(!!choice?.analytics);
  window.addEventListener('storage',e=>{
    if(e.key!==KEY && e.key!==null) return;
    const choice=read();
    if(loaded && !choice?.analytics) {apply(false);location.reload();return;}
    apply(!!choice?.analytics); panel.hidden=!!choice;
  });
  // Recheck expiry on long-lived tabs and restored pages.
  function recheck(){ const c=read(); if(!c){if(loaded){apply(false);location.reload();}else panel.hidden=false;} }
  window.addEventListener('pageshow',recheck);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden) recheck();});
  setInterval(recheck,60000);
})();
