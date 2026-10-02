(function(){
'use strict';

function build(){
  if(document.getElementById('abuNewNav')) return;

  const home=document.getElementById('home');
  if(!home) return;

  /* Safari does not always expose elements with IDs as global variables.
     The original app uses those names directly, so expose them explicitly. */
  ['levelTitle','subjects','moduleTitle','cardProgressMini','mcqProgressMini','flash','cardPct','cardProgress','mcqExplain','mcqPct','mcqProgress','bookHint','chatlog','question','pdfCanvas','pageLabel','mcqQuestion','mcqOptions','cardQuestion','cardAnswer'].forEach(id=>{
    const el=document.getElementById(id);
    if(el) window[id]=el;
  });

  document.body.classList.add('abu-redesign-ready');
  home.classList.add('abu-home-redesigned');

  const nav=document.createElement('nav');
  nav.id='abuNewNav';
  nav.className='abu-new-nav';
  nav.innerHTML=`<img class="abu-logo-mini" src="logo-mini.svg" alt="أبو شريك">
    <button type="button" class="abu-nav-link" data-home>الرئيسية</button>
    <button type="button" class="abu-nav-link" data-levels>اختر مرحلتك</button>
    <button type="button" class="abu-nav-link" data-future>مستقبلك بعد البكالوريا</button>
    <button type="button" class="abu-nav-link" data-about>من نحن</button>
    <button type="button" class="abu-login-pill" id="abuTopAccount"><span>👤</span> تسجيل الدخول</button>`;
  document.body.insertBefore(nav,document.body.firstChild);

  const landing=document.createElement('div');
  landing.id='abuLandingView';
  landing.innerHTML=`<section class="abu-hero-new">
      <div class="abu-mascot-wrap"><img class="abu-mascot" src="logo-mini.svg" alt="أبو شريك"></div>
      <div class="abu-hero-copy">
        <p class="abu-eyebrow">مرحباً بك في أبو شريك</p>
        <h1>شريكك الدراسي إلى النجاح</h1>
        <button type="button" class="abu-start" data-start>ابدأ رحلتك الآن <span>←</span></button>
        <p class="abu-hero-note">اختر مرحلتك الدراسية وابدأ الدراسة بطريقة تناسبك</p>
      </div>
    </section>
    <section class="abu-feature-strip" id="abuAbout">
      <div class="abu-feature"><div style="font-size:34px">📚</div><b>منهجك في مكان واحد</b><span>موادك وكتبك وطرق الدراسة ضمن تجربة واحدة.</span></div>
      <div class="abu-feature"><div style="font-size:34px">🧠</div><b>دراسة أذكى</b><span>بطاقات وأسئلة وشرح يساعدك على الفهم والمراجعة.</span></div>
      <div class="abu-feature"><div style="font-size:34px">🎓</div><b>خطّط لمستقبلك</b><span>تعرّف على التخصصات والدراسة بعد البكالوريا.</span></div>
    </section>`;

  const chooser=document.createElement('div');
  chooser.id='abuLevelView';
  chooser.className='abu-view-hidden';
  chooser.innerHTML=`<section class="abu-level-page">
      <button class="abu-back-home" type="button">→ العودة للرئيسية</button>
      <h1 class="abu-level-title">اختر مرحلتك الدراسية</h1>
      <p class="abu-level-subtitle">اختر المرحلة التي تدرس فيها لنأخذك مباشرة إلى موادك</p>
      <div class="abu-level-grid">
        <article class="abu-level-card" data-open="تاسع"><img class="abu-level-icon" src="grade9.svg" alt=""><h2>الصف التاسع</h2><p>المنهاج والتدريبات</p><button class="abu-level-go" type="button">ابدأ الآن</button></article>
        <article class="abu-level-card" data-open="بكالوريا علمي"><img class="abu-level-icon" src="mint-abitur.svg" alt=""><h2>البكالوريا العلمي</h2><p>المنهاج والتدريبات</p><button class="abu-level-go" type="button">ابدأ الآن</button></article>
        <article class="abu-level-card" data-open="بكالوريا أدبي"><img class="abu-level-icon" src="literary-abitur.svg" alt=""><h2>البكالوريا الأدبي</h2><p>المنهاج والتدريبات</p><button class="abu-level-go" type="button">ابدأ الآن</button></article>
      </div>
    </section>`;

  home.insertBefore(chooser,home.firstChild);
  home.insertBefore(landing,home.firstChild);

  function callGlobal(name,...args){
    try{
      const fn=window[name];
      if(typeof fn==='function'){ fn(...args); return true; }
    }catch(e){ console.error(name,e); }
    return false;
  }

  function ensureHome(){
    if(!callGlobal('show','home')){
      document.querySelectorAll('main>section').forEach(x=>x.classList.add('hidden'));
      home.classList.remove('hidden');
    }
  }

  function setHash(hash){
    try{ history.replaceState(null,'',location.pathname+location.search+hash); }
    catch(e){ location.hash=hash; }
  }

  function homeView(){
    ensureHome();
    landing.classList.remove('abu-view-hidden');
    chooser.classList.add('abu-view-hidden');
    setHash('');
    window.scrollTo({top:0,left:0,behavior:'auto'});
  }

  function levels(){
    ensureHome();
    landing.classList.add('abu-view-hidden');
    chooser.classList.remove('abu-view-hidden');
    setHash('#levels');
    window.scrollTo({top:0,left:0,behavior:'auto'});
  }

  function openStage(level){
    /* First use the original application navigation. The explicit globals
       above make it reliable in Safari as well as Chromium browsers. */
    if(callGlobal('openLevel',level)){
      landing.classList.add('abu-view-hidden');
      chooser.classList.add('abu-view-hidden');
      setHash('');
      return;
    }

    /* Safe fallback: build the subject screen ourselves. */
    const map={
      'تاسع':['اللغة العربية','الرياضيات','علم الأحياء والأرض','الفيزياء والكيمياء','التاريخ','الجغرافيا','التربية الوطنية','التربية الإسلامية','التربية المسيحية','الفنون'],
      'بكالوريا علمي':['اللغة العربية','الرياضيات','الفيزياء','الكيمياء','علم الأحياء','اللغة الإنكليزية','التربية الوطنية'],
      'بكالوريا أدبي':['اللغة العربية','الفلسفة','التاريخ','الجغرافيا','اللغة الإنكليزية','التربية الوطنية']
    };
    const title=document.getElementById('levelTitle');
    const box=document.getElementById('subjects');
    if(!title||!box) return;
    title.textContent=level;
    box.innerHTML='';
    (map[level]||[]).forEach(subject=>{
      const d=document.createElement('div');
      d.className='subject';
      d.textContent=subject;
      d.addEventListener('click',()=>callGlobal('openSubject',subject));
      box.appendChild(d);
    });
    document.querySelectorAll('main>section').forEach(x=>x.classList.add('hidden'));
    document.getElementById('level').classList.remove('hidden');
    landing.classList.add('abu-view-hidden');
    chooser.classList.add('abu-view-hidden');
    setHash('');
  }

  nav.querySelector('[data-home]').addEventListener('click',homeView);
  nav.querySelector('[data-levels]').addEventListener('click',levels);
  landing.querySelector('[data-start]').addEventListener('click',levels);
  chooser.querySelector('.abu-back-home').addEventListener('click',homeView);

  nav.querySelector('[data-about]').addEventListener('click',()=>{
    homeView();
    setTimeout(()=>document.getElementById('abuAbout')?.scrollIntoView({behavior:'smooth'}),30);
  });

  nav.querySelector('[data-future]').addEventListener('click',()=>{
    if(callGlobal('openFuture')) return;
    const future=document.querySelector('[data-future-card]');
    if(future) future.click();
  });

  chooser.querySelectorAll('.abu-level-card').forEach(card=>{
    card.addEventListener('click',e=>{
      e.preventDefault();
      e.stopPropagation();
      openStage(card.dataset.open);
    });
  });

  const account=document.getElementById('abuTopAccount');
  account.addEventListener('click',()=>{
    const b=document.getElementById('abuProfileBtn');
    if(b){ b.click(); return; }
    const overlay=document.getElementById('abuAuthOverlay');
    if(overlay) overlay.classList.remove('abu-auth-hidden');
  });

  let syncQueued=false;
  function syncAccount(){
    syncQueued=false;
    const b=document.getElementById('abuProfileBtn');
    if(!b) return;
    const text=(b.textContent||'').trim();
    account.innerHTML=text.includes('⚙️')?`⚙️ ${text.replace('⚙️','').trim()}`:`👤 ${text.replace('👤','').trim()}`;
  }
  const observer=new MutationObserver(()=>{
    if(syncQueued) return;
    syncQueued=true;
    requestAnimationFrame(syncAccount);
  });
  observer.observe(document.body,{childList:true,subtree:true,characterData:true});
  syncAccount();

  if(location.hash==='#levels') levels(); else homeView();
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',build,{once:true});
else build();
})();