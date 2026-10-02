// Replace only the large home-page mascot. Keep the navbar logo unchanged.
(function(){
  'use strict';
  const MASCOT='./6F2B9AC5-757A-4DBA-877B-3FF53BE09EC0.png?v=20261002-1';
  function applyMascot(){
    const img=document.querySelector('#abuLandingView .abu-mascot');
    if(!img)return false;
    img.src=MASCOT;
    img.alt='أبو شريك';
    img.style.width='100%';
    img.style.height='100%';
    img.style.objectFit='contain';
    img.style.display='block';
    return true;
  }
  if(!applyMascot()){
    const observer=new MutationObserver(()=>{if(applyMascot())observer.disconnect()});
    observer.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(()=>observer.disconnect(),10000);
  }
})();
