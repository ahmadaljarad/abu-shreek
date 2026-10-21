/* Abu Shreek book catalogue and resilient reader — 2026-10-21 */
(function(){
'use strict';
const base='https://github.com/ahmadaljarad/abu-shreek/releases/download/books-v1/';
const catalogue={
'تاسع':{
'الرياضيات':['9-Algebra.pdf','9-Geometry.pdf'],
'اللغة العربية':['9-Arabic.pdf'],
'الفنون':['9-Art.pdf'],
'التاريخ':['9-History.pdf'],
'الجغرافيا':['9-Geography.pdf'],
'التربية الوطنية':['9-National.pdf'],
'الفيزياء والكيمياء':['9-Physics-Chemistry.pdf'],
'التربية الإسلامية':['9-Islamic.pdf'],
'التربية المسيحية':['9-Christianity.pdf'],
'علم الأحياء والأرض':['9-Science.pdf'],
'اللغة الإنكليزية':['9-English-SB.pdf','9-English-AB.pdf'],
'اللغة الفرنسية':['9-French-SB.pdf','9-French-AB.pdf'],
'اللغة الروسية':['9-Russian.pdf'],
'الموسيقا':['9-Music.pdf'],
'التقانة':['9-Technology.pdf']
},
'بكالوريا علمي':{
'اللغة العربية':['bac-sci-arabic.pdf'],
'الرياضيات':['bac-sci-math-1.pdf','bac-sci-math-2.pdf'],
'الفيزياء':['bac-sci-physics.pdf'],
'الكيمياء':['bac-sci-chemistry.pdf'],
'علم الأحياء':['bac-sci-biology.pdf'],
'اللغة الإنكليزية':['bac-sci-english-sb.pdf','bac-sci-english-ab.pdf'],
'اللغة الفرنسية':['bac-sci-french.pdf'],
'اللغة الروسية':['bac-sci-russian.pdf'],
'التربية الإسلامية':['bac-sci-islamic.pdf'],
'التربية المسيحية':['bac-sci-christian.pdf']
},
'بكالوريا أدبي':{
'اللغة العربية':['bac-lit-arabic.pdf'],
'الفلسفة':['bac-lit-philosophy-1.pdf','bac-lit-philosophy-2.pdf'],
'التاريخ':['bac-lit-history.pdf'],
'الجغرافيا':['bac-lit-geography.pdf'],
'اللغة الإنكليزية':['bac-lit-english-sb.pdf','bac-lit-english-ab.pdf'],
'اللغة الفرنسية':['bac-lit-french.pdf','bac-lit-french-annex.pdf'],
'اللغة الروسية':['bac-lit-russian.pdf'],
'التربية الإسلامية':['bac-lit-islamic.pdf'],
'التربية المسيحية':['bac-lit-christian.pdf']
}};
const url=f=>base+encodeURIComponent(f);
const proxy=f=>'https://abu-shreek-api.ahmad-aljarad.workers.dev/api/book?file='+encodeURIComponent(f);

const css=document.createElement('style');css.textContent='.abu-book-options{display:flex;flex-wrap:wrap;align-items:center;gap:9px;margin:12px 0;padding:12px;border:1px solid #dce8e5;border-radius:12px;background:#f7fbfa}.abu-book-options a,.abu-book-options button{display:inline-block;background:#e7f5f2;color:#08766e;border:0;border-radius:9px;padding:9px 12px;font:inherit;font-weight:700;text-decoration:none;cursor:pointer}.abu-book-options button[aria-pressed=true]{background:#0f766e;color:white}.abu-book-status{margin:8px 0;color:#64748b}';document.head.appendChild(css);
function options(){let el=document.getElementById('abuBookOptions');if(!el){el=document.createElement('div');el.id='abuBookOptions';el.className='abu-book-options';document.querySelector('#book .viewer .actions')?.after(el)}return el}
function hint(s){const el=document.getElementById('bookHint');if(el)el.textContent=s}
function list(){return catalogue[state.level]?.[state.subject]||[]}
function openExternal(f){window.open(url(f),'_blank','noopener,noreferrer')}
async function load(f){
 document.getElementById('abuPdfFallback')?.remove();const o=options();o.querySelectorAll('button[data-book]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.book===f)));
 state.pdf=null;state.page=1;state.pageText='';const canvas=document.getElementById('pdfCanvas');if(canvas){canvas.width=0;canvas.height=0}
 const label=document.getElementById('pageLabel');if(label)label.textContent='صفحة 1';
 hint('جارٍ فتح الكتاب...');
 const folder=f.replace(/\.pdf$/i,'');
 try{
  const response=await fetch('./book-pages/'+folder+'/count.txt',{cache:'no-store'});
  if(response.ok){
   const count=Number((await response.text()).trim());
   if(Number.isInteger(count)&&count>0){
    state.imageBook=true;state.imageFile=f;state.imagePages=count;
    canvas.style.display='block';
    document.querySelector('#book .viewer .actions').style.display='flex';
    await window.renderPage();showStudyButtons();return;
   }
  }
 }catch(error){console.info('Images not ready',error)}
 state.imageBook=false;
 if(false){const frame=document.createElement('iframe');frame.id='abuPdfFallback';frame.title='قراءة الكتاب العربي داخل أبو شريك';frame.src=proxy(f);frame.style.cssText='display:block;width:100%;height:75vh;min-height:550px;border:1px solid #dce8e5;border-radius:12px;background:white';document.getElementById('pdfCanvas')?.after(frame);document.getElementById('pdfCanvas').style.display='none';document.querySelector('#book .viewer .actions').style.display='none';hint('الكتاب معروض باستخدام قارئ المتصفح للحفاظ على اتصال الأحرف العربية. يمكنك التنقل داخل الكتاب من شريط القارئ.');return}
 document.getElementById('pdfCanvas').style.display='block';document.querySelector('#book .viewer .actions').style.display='flex';
 if(!window.pdfjsLib){hint('تعذّر تشغيل عارض PDF. يمكنك فتح الكتاب مباشرة.');return}
 try{
  const task=window.pdfjsLib.getDocument({url:proxy(f),withCredentials:false,disableAutoFetch:false,disableStream:false,rangeChunkSize:262144});
  state.pdf=await task.promise;await window.renderPage();
 }catch(e){console.warn('Abu book inline preview unavailable',f,e);hint('تعذّر عرض صفحات الكتاب باستخدام القارئ. نجرب عرض PDF داخل الصفحة مباشرة.');const frame=document.createElement('iframe');frame.title='قراءة الكتاب داخل أبو شريك';frame.src=proxy(f);frame.style.cssText='display:block;width:100%;height:75vh;min-height:550px;border:1px solid #dce8e5;border-radius:12px;background:white';const old=document.getElementById('abuPdfFallback');if(old)old.remove();frame.id='abuPdfFallback';document.getElementById('pdfCanvas')?.after(frame);const label=document.getElementById('pageLabel');if(label)label.textContent='قارئ الكتاب';}
}
let selecting=false;
function enablePageSelection(){
 const canvas=document.getElementById('pdfCanvas');if(!canvas)return;
 selecting=true;
 const parent=canvas.parentElement;parent.style.position='relative';
 let overlay=document.getElementById('abuSelectionOverlay');
 if(!overlay){overlay=document.createElement('canvas');overlay.id='abuSelectionOverlay';overlay.style.cssText='position:absolute;z-index:10;touch-action:none;cursor:crosshair';parent.appendChild(overlay)}
 const rect=canvas.getBoundingClientRect(),pr=parent.getBoundingClientRect();
 overlay.style.left=(rect.left-pr.left)+'px';overlay.style.top=(rect.top-pr.top)+'px';
 overlay.style.width=rect.width+'px';overlay.style.height=rect.height+'px';
 overlay.width=Math.round(rect.width*devicePixelRatio);overlay.height=Math.round(rect.height*devicePixelRatio);
 const ctx=overlay.getContext('2d');let start=null;
 function point(e){const b=overlay.getBoundingClientRect();return {x:(e.clientX-b.left)*overlay.width/b.width,y:(e.clientY-b.top)*overlay.height/b.height}}
 overlay.onpointerdown=e=>{start=point(e);overlay.setPointerCapture(e.pointerId)};
 overlay.onpointermove=e=>{if(!start)return;const p=point(e);ctx.clearRect(0,0,overlay.width,overlay.height);ctx.fillStyle='rgba(20,184,166,.2)';ctx.strokeStyle='#0f766e';ctx.lineWidth=3;ctx.fillRect(start.x,start.y,p.x-start.x,p.y-start.y);ctx.strokeRect(start.x,start.y,p.x-start.x,p.y-start.y)};
 overlay.onpointerup=e=>{
  if(!start)return;const p=point(e),x=Math.min(start.x,p.x),y=Math.min(start.y,p.y),w=Math.abs(p.x-start.x),h=Math.abs(p.y-start.y);start=null;
  overlay.remove();selecting=false;
  if(w<20||h<20)return;
  const sx=canvas.width/overlay.width,sy=canvas.height/overlay.height;
  const crop=document.createElement('canvas');crop.width=Math.round(w*sx);crop.height=Math.round(h*sy);
  crop.getContext('2d').drawImage(canvas,x*sx,y*sy,w*sx,h*sy,0,0,crop.width,crop.height);
  if(typeof window.ABU_ASK_SELECTED==='function')window.ABU_ASK_SELECTED(crop);
 };
 const msg=document.getElementById('bookHint');if(msg)msg.textContent='اسحب بإصبعك أو الماوس لتحديد النص المطلوب شرحه.';
}
function showStudyButtons(){
 const side=document.querySelector('#book .side');
 if(!side)return;
 let panel=document.getElementById('abuPageStudyTools');
 if(!panel){
  panel=document.createElement('div');panel.id='abuPageStudyTools';
  panel.style.cssText='margin:14px 0;padding:14px;background:#f0faf7;border:1px solid #cde6dd;border-radius:12px;direction:rtl';
  const title=document.createElement('strong');title.textContent='🧠 أدوات دراسة الصفحة الحالية';panel.appendChild(title);
  const actions=document.createElement('div');actions.style.cssText='display:flex;flex-wrap:wrap;gap:8px;margin-top:12px';
  for(const [label,type] of [['📖 اشرح الصفحة','explain'],['✏️ حل التمارين','solve'],['💡 تلميح','hint'],['🧩 خطوة بخطوة','steps'],['📝 تمرين مشابه','similar']]){
   const b=document.createElement('button');b.type='button';b.textContent=label;
   b.style.cssText='border:1px solid #b6d9d0;border-radius:9px;background:white;color:#0f766e;padding:9px;cursor:pointer;font-weight:700';
   b.addEventListener('click',()=>{if(typeof window.scienceAction==='function')window.scienceAction(type);else alert('أعد تحميل الصفحة لتفعيل أدوات الدراسة.')});
   actions.appendChild(b);
  }
  const select=document.createElement('button');select.type='button';select.textContent='🔍 حدّد جزءاً من الصفحة';select.style.cssText='margin-top:10px;padding:10px;border:1px solid #0f766e;border-radius:9px;background:#e7f5f2;color:#0f766e;cursor:pointer';select.onclick=enablePageSelection;panel.appendChild(actions);panel.appendChild(select);
  const exam=document.createElement('button');exam.type='button';exam.textContent='📝 أسئلة امتحانية من الصفحة';exam.style.cssText=select.style.cssText;exam.style.marginRight='8px';exam.onclick=()=>window.ABU_EXAM_QUESTIONS?.();panel.appendChild(exam);
 }
 const input=side.querySelector('textarea');
 if(input){const wrap=input.closest('form')||input.parentElement;if(wrap&&wrap.parentElement)wrap.parentElement.appendChild(panel);else side.appendChild(panel)}
 else side.appendChild(panel);
}
const originalRender=window.renderPage;
window.renderPage=async function(){
 document.getElementById('abuSelectionOverlay')?.remove();selecting=false;
 if(!state.imageBook)return originalRender();
 const current=state.page, file=state.imageFile;
 const canvas=document.getElementById('pdfCanvas');
 const img=new Image();
 document.getElementById('pageLabel').textContent='صفحة '+current+' من '+state.imagePages;
 hint('جارٍ تحميل الصفحة...');
 img.onload=function(){
  if(state.page!==current||state.imageFile!==file)return;
  canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;
  canvas.getContext('2d').drawImage(img,0,0);
  hint('الصفحة معروضة بصورة واضحة.');
 };
 img.onerror=function(){hint('تعذّر تحميل صورة الصفحة. يمكنك فتح ملف PDF الأصلي.')};
 img.src='./book-pages/'+file.replace(/\.pdf$/i,'')+'/'+String(current).padStart(3,'0')+'.webp';
};
const previousPage=window.prevPage,followingPage=window.nextPage;
window.prevPage=async function(){
 if(state.imageBook){if(state.page>1){state.page--;await window.renderPage()}return}
 return previousPage();
};
window.nextPage=async function(){
 if(state.imageBook){if(state.page<state.imagePages){state.page++;await window.renderPage()}return}
 return followingPage();
};
window.openBook=async function(){
 window.show('book');showStudyButtons();const log=document.getElementById('chatlog');if(log)log.innerHTML='';
 const files=list();const o=options();o.replaceChildren();
 if(!files.length){hint('لا يوجد كتاب مربوط بهذه المادة حالياً.');return}
 const label=document.createElement('strong');label.textContent=files.length>1?'اختر الكتاب:':'الكتاب:';o.appendChild(label);
 files.forEach((f,i)=>{
  const b=document.createElement('button');b.type='button';b.dataset.book=f;b.textContent=files.length>1?'الجزء '+(i+1):'عرض الكتاب';b.onclick=()=>load(f);o.appendChild(b);
  const a=document.createElement('a');a.href=url(f);a.target='_blank';a.rel='noopener noreferrer';a.textContent='فتح '+(files.length>1?'الجزء '+(i+1):'الكتاب')+' مباشرة ↗';o.appendChild(a);
 });
 await load(files[0]);
};
const oldOpenLevel=window.openLevel;
window.openLevel=function(level){
 const subjects=subjectsByLevel[level];if(subjects){Object.keys(catalogue[level]||{}).forEach(s=>{if(!subjects.includes(s))subjects.push(s)})}
 return oldOpenLevel.apply(this,arguments);
};
window.ABU_BOOK_CATALOGUE=catalogue;
})();
