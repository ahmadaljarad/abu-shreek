/* Replace only the Grade 9 home-card emoji with the custom icon. */
(function(){
  function applyGrade9Icon(){
    const cards=[...document.querySelectorAll('#home .grid .card')];
    const card=cards.find(c=>c.querySelector('h2')?.textContent.trim()==='الصف التاسع');
    if(!card) return;
    const icon=card.querySelector('.icon');
    if(!icon || icon.querySelector('img')) return;
    icon.innerHTML='<img src="grade9.svg?v=20261001-2" alt="أيقونة الصف التاسع" style="width:48px;height:48px;display:block;object-fit:contain">';
  }
  window.addEventListener('DOMContentLoaded',applyGrade9Icon);
  if(document.readyState!=='loading') applyGrade9Icon();
})();