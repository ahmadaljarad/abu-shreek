/* أبو شريك - ارفع ملفك وادرسه. ميزة مستقلة لا تغيّر أدوات الدراسة الحالية. */
(function(){
let currentFile=null,currentText='',currentImage='';
const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function inject(){
 const home=document.getElementById('home'); if(!home||document.getElementById('uploadStudyCard'))return;
 const card=document.createElement('div');card.id='uploadStudyCard';card.className='card';card.style.marginTop='18px';card.onclick=openUploadStudy;
 card.innerHTML='<div class="icon">📎</div><h2>ارفع ملفك وادرسه</h2><p>ارفع صورة أو PDF أو ملفاً نصياً، ثم اطلب الشرح أو الحل أو الملخص أو البطاقات والأسئلة.</p>';
 const grid=home.querySelector('.grid'); if(grid)grid.insertAdjacentElement('afterend',card);
 const sec=document.createElement('section');sec.id='uploadStudy';sec.className='hidden';sec.innerHTML=`
 <div class="topbar"><button class="btn soft" onclick="show('home')">← الرئيسية</button><h2>📎 ارفع ملفك وادرسه</h2></div>
 <div class="study">
  <div id="uploadDrop" style="border:2px dashed #b7d8d2;border-radius:18px;padding:28px;text-align:center;background:#f8fafc">
   <div style="font-size:42px">📄📷</div><h3>اختر صورة أو PDF أو ملفاً نصياً</h3>
   <p class="note">PDF، JPG، PNG، WEBP، TXT — الحد الأقصى 8 MB. الملف يستخدم لهذه الجلسة فقط ولا يُضاف إلى كتب المنصة.</p>
   <input id="studyFileInput" type="file" accept=".pdf,.txt,.md,image/jpeg,image/png,image/webp" style="display:none">
   <button class="btn primary" id="chooseStudyFile">اختيار ملف</button>
  </div>
  <div id="studyFileInfo" class="hidden" style="margin-top:16px;padding:14px;border:1px solid #dce8e5;border-radius:14px"></div>
  <div id="studyFileActions" class="hidden" style="margin-top:18px">
   <h3>ماذا تريد من أبو شريك؟</h3>
   <div class="actions" style="justify-content:flex-start">
    <button class="btn soft" data-file-action="explain">📖 اشرح المحتوى</button>
    <button class="btn soft" data-file-action="solve">✏️ حل الأسئلة</button>
    <button class="btn soft" data-file-action="summary">📝 لخّص الملف</button>
    <button class="btn soft" data-file-action="cards">🗂️ بطاقات تعليمية</button>
    <button class="btn soft" data-file-action="mcq">✅ اختيار من متعدد</button>
   </div>
   <h3 style="margin-top:20px">💬 اسأل عن الملف</h3>
   <div class="row"><input id="fileStudyQuestion" placeholder="مثال: اشرح لي السؤال الثالث"><button class="btn primary" id="askFileButton">اسأل</button></div>
   <div id="fileStudyOutput" class="chatlog" style="max-height:none;margin-top:16px;white-space:pre-wrap;line-height:1.9"></div>
  </div>
 </div>`;
 document.querySelector('main').appendChild(sec);
 const input=sec.querySelector('#studyFileInput');sec.querySelector('#chooseStudyFile').onclick=()=>input.click();input.onchange=()=>handleFile(input.files[0]);
 sec.querySelectorAll('[data-file-action]').forEach(b=>b.onclick=()=>runAction(b.dataset.fileAction));sec.querySelector('#askFileButton').onclick=()=>{const q=sec.querySelector('#fileStudyQuestion').value.trim();if(q)askFile(q)};
}
window.openUploadStudy=function(){inject();show('uploadStudy')};
async function handleFile(f){if(!f)return;if(f.size>8*1024*1024){return info('الملف أكبر من 8 MB. اختر ملفاً أصغر.','err')}currentFile=f;currentText='';currentImage='';info(`جارٍ تجهيز: ${f.name} ...`);
 try{if(f.type.startsWith('image/')){currentImage=await dataURL(f);info(`📷 ${f.name}<br><span class="note">الصورة جاهزة للتحليل.</span>`,'ok')}
 else if(f.type==='application/pdf'||/\.pdf$/i.test(f.name)){currentText=await pdfText(f);info(`📄 ${f.name}<br><span class="note">تم استخراج ${currentText.length.toLocaleString('ar')} حرفاً من النص.</span>`,'ok')}
 else {currentText=(await f.text()).slice(0,45000);info(`📄 ${f.name}<br><span class="note">الملف جاهز للدراسة.</span>`,'ok')}
 document.getElementById('studyFileActions').classList.remove('hidden');
 }catch(e){console.error(e);info('تعذر قراءة هذا الملف. جرّب PDF نصياً أو صورة واضحة.','err')}
}
function info(html,type){const d=document.getElementById('studyFileInfo');d.classList.remove('hidden');d.innerHTML=html;if(type==='err')d.style.borderColor='#ef4444';else d.style.borderColor='#dce8e5'}
function dataURL(f){return new Promise((ok,bad)=>{const r=new FileReader();r.onload=()=>ok(String(r.result));r.onerror=bad;r.readAsDataURL(f)})}
async function pdfText(f){if(!window.pdfjsLib)throw Error('PDF');const buf=await f.arrayBuffer(),pdf=await pdfjsLib.getDocument({data:buf}).promise;let out=[];const max=Math.min(pdf.numPages,25);for(let n=1;n<=max;n++){const p=await pdf.getPage(n),t=await p.getTextContent();const s=t.items.map(x=>x.str||'').join(' ').replace(/\s+/g,' ').trim();if(s)out.push(`صفحة ${n}: ${s}`)}return out.join('\n').slice(0,45000)}
function promptFor(a){return {explain:'اشرح محتوى الملف للطالب بلغة عربية بسيطة ومنظمة، مع الالتزام فقط بالمعلومات الموجودة فيه.',solve:'استخرج الأسئلة أو التمارين الموجودة في الملف وحلها. في الرياضيات والفيزياء والكيمياء اعرض الحل خطوة بخطوة والنتيجة النهائية بوضوح.',summary:'لخّص أهم محتوى الملف للمراجعة، ولا تضف معلومات غير موجودة فيه.',cards:'أنشئ بطاقات تعليمية مفيدة من الملف بصيغة: السؤال — الجواب. اختر النقاط المهمة فقط.',mcq:'أنشئ أسئلة اختيار من متعدد من الملف. لكل سؤال أربعة خيارات، ثم اذكر الإجابة الصحيحة وتفسيراً قصيراً مستنداً إلى الملف.'}[a]}
async function runAction(a){return askFile(promptFor(a))}
async function askFile(q){const out=document.getElementById('fileStudyOutput');out.textContent='جارٍ تحليل الملف...';try{const body={question:q,fileName:currentFile?.name||'',fileText:currentText,imageData:currentImage,level:window.state?.level||''};const r=await fetch('/api/file-study',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const j=await r.json();out.textContent=j.answer||j.error||'لم تصل إجابة.'}catch(e){out.textContent='تعذر تحليل الملف حالياً. حاول مرة أخرى.'}}
window.addEventListener('DOMContentLoaded',inject);if(document.readyState!=='loading')inject();
})();