/* Custom home-card icons: Grade 9, MINT Abitur and literary Abitur. */
(function(){
  function setIcon(title,src,alt){
    const cards=[...document.querySelectorAll('#home .grid .card')];
    const card=cards.find(c=>c.querySelector('h2')?.textContent.trim()===title);
    if(!card) return;
    const icon=card.querySelector('.icon');
    if(!icon) return;
    icon.innerHTML=`<img src="${src}" alt="${alt}" style="width:48px;height:48px;display:block;object-fit:contain">`;
  }
  function applyHomeIcons(){
    setIcon('الصف التاسع','grade9.svg?v=20261001-2','أيقونة الصف التاسع');
    setIcon('بكالوريا علمي','mint-abitur.svg?v=20261001-1','أيقونة البكالوريا العلمي');
    setIcon('بكالوريا أدبي','literary-abitur.svg?v=20261001-1','أيقونة البكالوريا الأدبي');
  }
  window.addEventListener('DOMContentLoaded',applyHomeIcons);
  if(document.readyState!=='loading') applyHomeIcons();
})();