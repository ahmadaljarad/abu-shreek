/* Abu Shreek: navigation + upload icon reliability patch */
(function(){
'use strict';
const ICON=`<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" style="width:42px;height:42px;display:block;margin:0 auto 8px"><path fill="#225E61" d="M16.86 14.55c.35-.34.9-.33 1.24.02.33.34.33.88 0 1.21l-2.78 2.78a6.12 6.12 0 0 1-8.65-8.65l4.94-4.94a4.37 4.37 0 0 1 6.18-.11 4.37 4.37 0 0 1 .11 6.18l-.11.11-4.94 4.94a2.62 2.62 0 0 1-3.71-3.71l4.02-4.02a.88.88 0 0 1 1.24 1.24l-4.02 4.02a.88.88 0 0 0 1.24 1.24l4.94-4.94a2.62 2.62 0 0 0 .06-3.71 2.62 2.62 0 0 0-3.71-.06l-.06.06-4.95 4.94a4.37 4.37 0 0 0-.08 6.18 4.37 4.37 0 0 0 6.18.08l.08-.08 2.78-2.78z"/></svg>`;
function showLevelChooser(){
  const home=document.getElementById('home');
  const chooser=document.getElementById('abuLevelView');
  if(!home||!chooser)return;
  document.querySelectorAll('main>section').forEach(x=>x.classList.add('hidden'));
  home.classList.remove('hidden');
  ['abuLandingView','abuFutureView','abuFitView','abuInstitutesView','abuAboutView'].forEach(id=>document.getElementById(id)?.classList.add('abu-view-hidden'));
  chooser.classList.remove('abu-view-hidden');
  document.querySelectorAll('.abu-nav-link').forEach(x=>x.classList.remove('abu-nav-active'));
  document.querySelector('[data-levels]')?.classList.add('abu-nav-active');
  try{history.replaceState(null,'',location.pathname+location.search+'#levels')}catch(e){location.hash='#levels'}
  window.scrollTo({top:0,left:0,behavior:'auto'});
}
window.abuShowLevelChooser=showLevelChooser;
function installBack(){
  const level=document.getElementById('level');
  const bar=level?.querySelector('.topbar');
  if(!bar)return;
  let b=document.getElementById('abuBackToLevels');
  if(!b){b=document.createElement('button');b.id='abuBackToLevels';b.type='button';b.className='btn soft';b.textContent='→ اختر مرحلة أخرى';bar.prepend(b)}
  b.onclick=showLevelChooser;
  const old=[...bar.querySelectorAll('button')].find(x=>x!==b && (x.getAttribute('onclick')||'').includes("show('home')"));
  if(old){old.textContent='→ اختر مرحلة أخرى';old.removeAttribute('onclick');old.onclick=showLevelChooser;b.remove()}
}
function replaceIcons(){
  document.querySelectorAll('[data-upload-study]').forEach(card=>{const img=card.querySelector('img');if(img)img.outerHTML=ICON});
  const upload=document.getElementById('uploadStudy');
  if(upload){upload.querySelectorAll('img[src*="attach.svg"]').forEach(img=>{const wrap=document.createElement('span');wrap.innerHTML=ICON;const svg=wrap.firstElementChild;if(img.closest('h2')){svg.style.width='25px';svg.style.height='25px';svg.style.display='inline-block';svg.style.margin='0 0 0 7px';svg.style.verticalAlign='middle'}img.replaceWith(svg)})}
}
function apply(){installBack();replaceIcons()}
document.addEventListener('click',e=>{
  if(e.target.closest('#uploadBackLevel')){e.preventDefault();e.stopImmediatePropagation();showLevelChooser();return}
  if(e.target.closest('#abuBackToLevels')){e.preventDefault();e.stopImmediatePropagation();showLevelChooser();return}
},true);
const obs=new MutationObserver(apply);obs.observe(document.documentElement,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
})();