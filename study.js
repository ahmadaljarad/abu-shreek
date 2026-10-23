/* أبو شريك: الكتب + دراسة الصفحة الحالية + فيديوهات الدرس */
(function(){
const BOOKS={
'تاسع|اللغة العربية':'9-Arabic.pdf','تاسع|الرياضيات':'9-Algebra.pdf','تاسع|علم الأحياء والأرض':'9-Science.pdf','تاسع|الفيزياء والكيمياء':'9-Physics-Chemistry.pdf','تاسع|التاريخ':'9-History.pdf','تاسع|الجغرافيا':'9-Geography.pdf','تاسع|التربية الوطنية':'9-National.pdf','تاسع|التربية الإسلامية':'9-Islamic.pdf','تاسع|التربية المسيحية':'9-Christianity.pdf','تاسع|الفنون':'9-Art.pdf','تاسع|اللغة الإنكليزية':'9-English-SB.pdf','تاسع|اللغة الفرنسية':'9-French-SB.pdf','تاسع|اللغة الروسية':'9-Russian.pdf','تاسع|التقانة':'9-Technology.pdf','تاسع|الموسيقا':'9-Music.pdf',
'بكالوريا علمي|اللغة العربية':'bac-sci-arabic.pdf','بكالوريا علمي|الرياضيات':'bac-sci-math-1.pdf','بكالوريا علمي|الفيزياء':'bac-sci-physics.pdf','بكالوريا علمي|الكيمياء':'bac-sci-chemistry.pdf','بكالوريا علمي|علم الأحياء':'bac-sci-biology.pdf','بكالوريا علمي|اللغة الإنكليزية':'bac-sci-english-sb.pdf','بكالوريا علمي|اللغة الفرنسية':'bac-sci-french.pdf','بكالوريا علمي|اللغة الروسية':'bac-sci-russian.pdf','بكالوريا علمي|التربية الإسلامية':'bac-sci-islamic.pdf','بكالوريا علمي|التربية المسيحية':'bac-sci-christian.pdf',
'بكالوريا أدبي|اللغة العربية':'bac-lit-arabic.pdf','بكالوريا أدبي|الفلسفة':'bac-lit-philosophy-1.pdf','بكالوريا أدبي|التاريخ':'bac-lit-history.pdf','بكالوريا أدبي|الجغرافيا':'bac-lit-geography.pdf','بكالوريا أدبي|اللغة الإنكليزية':'bac-lit-english-sb.pdf','بكالوريا أدبي|اللغة الفرنسية':'bac-lit-french.pdf','بكالوريا أدبي|اللغة الروسية':'bac-lit-russian.pdf','بكالوريا أدبي|التربية الإسلامية':'bac-lit-islamic.pdf','بكالوريا أدبي|التربية المسيحية':'bac-lit-christian.pdf'};
Object.assign(bookFiles,BOOKS);
let generatedMCQ=[];
const norm=s=>String(s||'').replace(/\s+/g,' ').trim();
const isProblemSubject=()=>['الرياضيات','الفيزياء','الكيمياء','الفيزياء والكيمياء'].includes(state.subject);
const file=()=>BOOKS[`${state.level}|${state.subject}`]||bookFiles[`${state.level}|${state.subject}`]||'';
const url=f=>`/api/book?file=${encodeURIComponent(f)}`;
let studyTopic='';
let studyBook='';
let selectedVerifiedLesson=null;
const manualRanges={};
async function requestLessonRange(book,topic,reason){
 const locator=window.ABU_LESSON_SOURCE;
 let count=0;try{count=await locator.pageCount(book)}catch{}
 const answer=window.prompt('لم نتمكن من تحديد صفحات درس «'+topic+'» تلقائياً.\\nأدخل رقم أول وآخر صفحة من عارض الكتاب، مثال: 25-32\\nعدد صفحات الكتاب: '+count+'\\nلن نستخدم معلومات خارج الصفحات المحددة.','');
 if(answer===null)throw Error('LESSON_RANGE_CANCELLED');
 const match=String(answer).trim().match(/^(\d+)\s*[-–—,:،]\s*(\d+)$/);
 if(!match)throw Error('LESSON_RANGE_INVALID');
 const start=Number(match[1]),end=Number(match[2]);
 if(start<1||(count&&end>count)||end<start||end-start>14)throw Error('LESSON_RANGE_INVALID');
 return {start,end,book,topic,manual:true};
}
function chooseBookPart(){
 const choices=window.ABU_BOOK_CATALOGUE?.[state.level]?.[state.subject]||[file()];
 if(choices.length===1)return choices[0];
 const answer=window.prompt('اختر الجزء الذي تريد إنشاء البطاقات منه:\n'+choices.map((x,i)=>(i+1)+' - '+x.replace(/\.pdf$/i,'')).join('\n'),'1');
 if(answer===null)return null;
 const idx=Number(answer)-1;
 if(!Number.isInteger(idx)||idx<0||idx>=choices.length)throw Error('رقم الجزء غير صحيح');
 return choices[idx];
}
const pageKey=t=>studyTopic?key(t+':booksource:v3:'+(studyBook||file())+':'+studyTopic):key(t+':page:'+state.page);
const TOPIC_SUGGESTIONS={
 'علم الأحياء':['الجهاز العصبي','أنواع الخلايا العصبية','السيالة العصبية','المشابك العصبية','الجهاز الهرموني','التكاثر','الوراثة','المناعة'],
 'علم الأحياء والأرض':['الخلية','التغذية','التنفس','التكاثر','الوراثة','البيئة'],
 'الرياضيات':['المعادلات','المتراجحات','الدوال','النهايات','المشتقات','التكامل','الهندسة','الاحتمالات'],
 'الفيزياء':['الحركة','القوى','الطاقة','الكهرباء','المغناطيسية','الأمواج'],
 'الكيمياء':['بنية الذرة','الروابط الكيميائية','التفاعلات الكيميائية','الحموض والأسس','الكيمياء العضوية'],
 'الفيزياء والكيمياء':['الحركة والقوى','الطاقة','الكهرباء','بنية الذرة','التفاعلات الكيميائية'],
 'اللغة العربية':['النصوص الأدبية','القواعد النحوية','البلاغة','التعبير','الصرف'],
 'اللغة الإنكليزية':['القراءة والفهم','القواعد','المفردات','الكتابة'],
 'اللغة الفرنسية':['القراءة والفهم','القواعد','المفردات','التعبير الكتابي'],
 'التاريخ':['التاريخ الحديث','الأحداث السياسية','الشخصيات التاريخية'],
 'الجغرافيا':['الجغرافيا الطبيعية','السكان','المناخ','الموارد الطبيعية'],
 'الفلسفة':['المعرفة','المنطق','الأخلاق','الفلسفة السياسية']
};
function chooseStudyTopic(mode){
 document.getElementById('abuTopicDialog')?.remove();
 const overlay=document.createElement('div');overlay.id='abuTopicDialog';overlay.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.48);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;direction:rtl';
 const box=document.createElement('div');box.style.cssText='background:white;border-radius:16px;padding:24px;width:min(540px,100%);max-height:85vh;overflow:auto;box-shadow:0 15px 45px #0003;color:#123';
 const title=document.createElement('h2');title.textContent=mode==='cards'?'📚 اختر درس البطاقات التعليمية':'✅ اختر درس الاختيار من متعدد';box.appendChild(title);
 const info=document.createElement('p');info.textContent='المادة: '+state.subject+' — اختر الموضوع مباشرة دون فتح الكتاب.';box.appendChild(info);
 const catalog=window.ABU_VERIFIED_TOC||{};
 const entries=Array.isArray(catalog[state.level+'|'+state.subject])?catalog[state.level+'|'+state.subject]:[];
 const topics=entries.filter(x=>x&&x.verified===true&&x.scope!=='unit'&&typeof x.title==='string'&&Number.isInteger(x.start)&&Number.isInteger(x.end)&&x.start>=1&&x.end>=x.start&&x.end-x.start<=14);
 // For literary baccalaureate philosophy and history, show the published verified card library as the lesson list.
 if(state.level==='بكالوريا أدبي'&&['الفلسفة','التاريخ'].includes(state.subject)){
  const cardList=document.createElement('div');cardList.style.cssText='display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:9px;max-height:55vh;overflow:auto';
  const status=document.createElement('p');status.textContent='جارٍ تحميل الدروس التي تحتوي بطاقات جاهزة...';box.appendChild(status);box.appendChild(cardList);
  premadeCards().then(db=>{
   const lessons=(db.lessons||[]).filter(x=>x.level===state.level&&x.subject===state.subject&&x.status==='verified'&&Array.isArray(x.cards)&&x.cards.length);
   status.textContent='البطاقات الجاهزة: '+lessons.length+' درساً — '+lessons.reduce((n,x)=>n+x.cards.length,0)+' بطاقة. اختر درساً للبدء مباشرة.';
   for(const lesson of lessons){const b=document.createElement('button');b.type='button';b.textContent=lesson.topic+' ('+lesson.cards.length+' بطاقة)';b.style.cssText='padding:13px;text-align:right;background:#edf8f5;border:1px solid #c9e6df;border-radius:10px;color:#0e6961;cursor:pointer';b.onclick=()=>{selectedVerifiedLesson=null;studyBook=lesson.book||file();studyTopic=lesson.topic;window.ABU_STUDY_TOPIC=studyTopic;overlay.remove();mode==='cards'?startTopicCards():startTopicMCQ()};cardList.appendChild(b)}
  }).catch(()=>{status.textContent='تعذر تحميل مكتبة البطاقات. أعد تحميل الصفحة وحاول مجدداً.'});
  const close=document.createElement('button');close.textContent='إغلاق';close.style.cssText='margin-top:15px;padding:10px 18px;border:0;border-radius:9px;cursor:pointer';close.onclick=()=>overlay.remove();box.appendChild(close);overlay.onclick=e=>{if(e.target===overlay)overlay.remove()};overlay.appendChild(box);document.body.appendChild(overlay);return;
 }

 if(!topics.length){const warning=document.createElement('p');warning.textContent='لم يتم توثيق فهرس هذه المادة من الكتاب الأصلي بعد. يمكنك تحديد صفحات الدرس بنفسك لإنشاء بطاقات أو أسئلة من صفحات الكتاب حصراً، دون اختراع عناوين دروس.';warning.style.cssText='line-height:1.9;color:#9a3412;background:#fff7ed;padding:14px;border-radius:10px';box.appendChild(warning)}
 const selectedKey=state.level+'|'+state.subject;
 const savedConfirmed=(window.ABU_VERIFIED_TOC?.[selectedKey]||[]).filter(x=>x?.verified===true&&Number.isInteger(x.start)&&Number.isInteger(x.end)&&x.end>=x.start&&x.end-x.start<=14);
 if(savedConfirmed.length){const summary=document.createElement('p');summary.style.cssText='color:#0f766e;font-weight:700';summary.textContent='الدروس الموثقة المتاحة: '+savedConfirmed.length;box.appendChild(summary)}
 const drafts=(window.ABU_DRAFT_TOC?.[state.level+'|'+state.subject]||[]).filter(x=>x&&!entries.some(y=>y.title===x.title&&y.book===x.book));
 if(drafts.length){
  const info=document.createElement('p');info.textContent='فهرس الكتاب: '+drafts.length+' درساً بحسب ترتيب فهرس الكتاب الأصلي. اختر الدرس مباشرة.';info.style.cssText='color:#92400e;line-height:1.8';box.appendChild(info);
  const draftList=document.createElement('div');draftList.style.cssText='display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:9px;max-height:55vh;overflow:auto';
  for(const d of drafts){
   const b=document.createElement('button');b.type='button';b.textContent=d.title+' — '+(d.book.includes('-1.')?'الجزء الأول':'الجزء الثاني');b.style.cssText='padding:13px;text-align:right;background:#edf8f5;border:1px solid #c9e6df;border-radius:10px;color:#0e6961;cursor:pointer';
   b.onclick=()=>{selectedVerifiedLesson=null;studyBook=d.book;studyTopic=d.title;window.ABU_STUDY_TOPIC=d.title;overlay.remove();if(mode==='cards')startTopicCards();else startTopicMCQ();};
   draftList.appendChild(b);
  }
  box.appendChild(draftList);
 }
 const list=document.createElement('div');list.style.cssText='display:grid;grid-template-columns:repeat(auto-fit,minmax(175px,1fr));gap:9px';
 for(const lesson of topics){
  const topic=lesson.title;
  const b=document.createElement('button');b.type='button';b.textContent=topic+' (ص '+lesson.start+')';b.style.cssText='padding:13px;text-align:right;background:#edf8f5;color:#0e6961;border:1px solid #c9e6df;border-radius:10px;font-size:15px;cursor:pointer';
  b.onclick=()=>{selectedVerifiedLesson=lesson;studyBook=lesson.book||file();studyTopic=topic;window.ABU_STUDY_TOPIC=topic;overlay.remove();mode==='cards'?startTopicCards():startTopicMCQ()};
  list.appendChild(b);
 }
 box.appendChild(list);
 const manual=document.createElement('button');manual.type='button';manual.textContent='📖 اختر صفحات الدرس من الكتاب (جميع المواد)';manual.style.cssText='display:block;width:100%;margin-top:15px;padding:14px;background:#0e766e;color:white;border:0;border-radius:10px;cursor:pointer;font-size:15px';
 manual.onclick=async()=>{let f;try{f=chooseBookPart()}catch(e){alert(e.message);return}if(!f)return;try{const range=await requestLessonRange(f,'صفحات مختارة');const topic='صفحات '+range.start+'–'+range.end;manualRanges[f+'|'+topic]=range;selectedVerifiedLesson=null;studyBook=f;studyTopic=topic;window.ABU_STUDY_TOPIC=topic;overlay.remove();if(mode==='cards')await startTopicCards();else await startTopicMCQ()}catch(e){if(e.message!=='LESSON_RANGE_CANCELLED')alert(nice(e))}};
 box.appendChild(manual);
 const scan=document.createElement('button');scan.type='button';scan.textContent='🔎 اقرأ فهرس هذا الكتاب تلقائياً';scan.style.cssText='display:block;width:100%;margin-top:10px;padding:12px;background:#e7f5f2;color:#08645d;border:1px solid #b8ddd5;border-radius:10px;cursor:pointer;font-size:15px';
 scan.onclick=async()=>{
  const choices=window.ABU_BOOK_CATALOGUE?.[state.level]?.[state.subject]||[file()];
  let f=choices[0],locator=window.ABU_LESSON_SOURCE;
  if(choices.length>1){const answer=window.prompt('اختر رقم الكتاب لفحص فهرسه:\\n'+choices.map((x,i)=>(i+1)+' - '+x).join('\\n'),'1');if(answer===null){scan.disabled=false;return}const idx=Number(answer)-1;if(!Number.isInteger(idx)||idx<0||idx>=choices.length){alert('رقم الكتاب غير صحيح');return}f=choices[idx]}
  if(!f||!locator?.scanContents){alert('قارئ الفهرس غير متاح لهذا الكتاب.');return}
  scan.disabled=true;scan.textContent='جارٍ فحص فهرس الكتاب... قد يستغرق عدة دقائق';
  try{
   const cacheKey='abu:toc-scan:v1:'+f;
   let entries=null;
   try{const cached=JSON.parse(localStorage.getItem(cacheKey)||'null');if(Array.isArray(cached)&&cached.length)entries=cached}catch{}
   if(!entries&&/^bac-lit-philosophy-[12]\\.pdf$/.test(f)){
    try{
     const draftUrl='./data/toc-candidates/'+f.replace(/\\.pdf$/,'')+'.json';
     const response=await fetch(draftUrl);
     if(response.ok){
      const draft=await response.json();
      const contents=draft.pages?.find(p=>p.image_page===2);
      entries=(contents?.candidates||[]).filter(x=>/الدرس|الوحدة/.test(x.title_ocr||'')).map(x=>({title:x.title_ocr,printed:x.printed_page_ocr||'غير مؤكدة',verified:false}));
     }
    }catch{}
   }
   if(!entries){entries=await locator.scanContents(f,msg=>scan.textContent=msg);if(entries.length){try{localStorage.setItem(cacheKey,JSON.stringify(entries))}catch{}}}
   if(!entries.length){scan.textContent='لم يتمكن القارئ من استخراج فهرس واضح. استخدم اختيار الصفحات.';return}
   const heading=document.createElement('p');heading.textContent='عناوين مستخرجة آلياً من صور الفهرس، غير موثّقة بعد. اختر عنواناً لتحديد صفحاته والتحقق منها.';heading.style.cssText='color:#92400e;line-height:1.8';list.replaceChildren(heading);
   for(const entry of entries){
    const b=document.createElement('button');b.type='button';b.textContent=entry.title+' (الصفحة المطبوعة: '+entry.printed+')';b.style.cssText='padding:12px;text-align:right;background:#fff8e9;color:#704b11;border:1px solid #edd6a0;border-radius:9px;cursor:pointer';
    b.onclick=async()=>{try{const range=await requestLessonRange(f,entry.title);manualRanges[f+'|'+entry.title]=range;studyBook=f;window.ABU_SAVE_CONFIRMED_LESSON?.(state.level,state.subject,{title:entry.title,start:range.start,end:range.end,book:f});studyTopic=entry.title;window.ABU_STUDY_TOPIC=entry.title;overlay.remove();if(mode==='cards')await startTopicCards();else await startTopicMCQ()}catch(e){if(e.message!=='LESSON_RANGE_CANCELLED')alert(nice(e))}};
    list.appendChild(b);
   }
   scan.textContent='تم العثور على '+entries.length+' عنواناً أولياً. تأكد من الصفحات قبل حفظ كل درس.';
   const help=document.createElement('p');help.style.cssText='color:#64748b;font-size:13px;line-height:1.7';help.textContent='الصفحة المطبوعة في الفهرس قد تختلف عن رقم صفحة العارض. افتح الكتاب وقارن العنوان ثم أدخل نطاق صفحات العارض الصحيح.';list.prepend(help);
  }catch(e){scan.textContent='تعذرت قراءة الفهرس: '+nice(e)}
  finally{scan.disabled=false}
 };
 box.appendChild(scan);
 const note=document.createElement('p');note.style.cssText='font-size:12px;color:#64748b;margin-top:15px';note.textContent='تظهر فقط الدروس التي جرى التحقق من عناوينها وصفحاتها مقابل الكتاب الأصلي.';box.appendChild(note);
 const close=document.createElement('button');close.textContent='إغلاق';close.style.cssText='padding:9px 16px;border:0;border-radius:9px;cursor:pointer';close.onclick=()=>overlay.remove();box.appendChild(close);
 overlay.onclick=e=>{if(e.target===overlay)overlay.remove()};
 overlay.appendChild(box);document.body.appendChild(overlay);
}

async function loadPdf(){if(state.pdf)return state.pdf;const f=file();if(!f)throw new Error('NO_BOOK');state.pdf=await pdfjsLib.getDocument({url:url(f),disableAutoFetch:true,disableStream:false,rangeChunkSize:262144}).promise;return state.pdf}
async function digitalText(n){const pdf=await loadPdf(),p=await pdf.getPage(n),t=await p.getTextContent();return norm(t.items.map(x=>x.str||'').join(' '))}
let ocrPromise=null,workerPromise=null;
function loadOCR(){if(window.Tesseract)return Promise.resolve();if(ocrPromise)return ocrPromise;ocrPromise=new Promise((ok,bad)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';s.onload=ok;s.onerror=()=>bad(new Error('OCR_LOAD'));document.head.appendChild(s)});return ocrPromise}
async function worker(){await loadOCR();if(!workerPromise)workerPromise=Tesseract.createWorker('ara+eng');return workerPromise}
async function imageText(n){
 const f=state.imageFile||file();
 const ck='abu:ocr-webp-v1:'+f+':'+n;
 let saved='';try{saved=localStorage.getItem(ck)||''}catch{}
 if(saved.length>60)return saved;
 let canvas;
 if(state.imageBook&&f){
  const src='./book-pages/'+f.replace(/\.pdf$/i,'')+'/'+String(n).padStart(3,'0')+'.webp';
  const image=new Image();
  image.src=src;
  await image.decode();
  canvas=document.createElement('canvas');
  canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
  canvas.getContext('2d',{willReadFrequently:true}).drawImage(image,0,0);
 }else{
  const pdf=await loadPdf(),p=await pdf.getPage(n),v=p.getViewport({scale:1.35});
  canvas=document.createElement('canvas');canvas.width=Math.ceil(v.width);canvas.height=Math.ceil(v.height);
  await p.render({canvasContext:canvas.getContext('2d',{alpha:false}),viewport:v}).promise;
 }
 const w=await worker(),r=await w.recognize(canvas),t=norm(r?.data?.text);
 if(t.length>40)try{localStorage.setItem(ck,t)}catch{}
 return t;
}
async function currentText(){
 if(state.imageBook)return imageText(state.page||1);
 let t=norm(state.pageText);if(t.length>=80)return t;
 try{t=await digitalText(state.page||1)}catch{}
 if(t.length>=80)return t;
 return imageText(state.page||1);
}
async function studySource(){let parts=[];const here=await currentText();if(here.length>=60)parts.push(`الصفحة الحالية ${state.page}: ${here}`);if(state.imageBook)return parts.join('\n').slice(0,7000);const pdf=await loadPdf();for(const n of [state.page+1,state.page-1]){if(n<1||n>pdf.numPages)continue;try{const t=await digitalText(n);if(t.length>=100)parts.push(`صفحة ${n}: ${t}`)}catch{}}return parts.join('\n').slice(0,7000)}

function ensureVideos(){let b=document.getElementById('lessonVideos');if(b)return b;const side=document.querySelector('#book .side');if(!side)return null;b=document.createElement('div');b.id='lessonVideos';b.style.cssText='margin-top:18px;padding-top:14px;border-top:1px solid #dce8e5';side.appendChild(b);return b}
function videoTopic(){const t=norm(state.pageText);return t.length>25?t.slice(0,130):`${state.subject} ${state.level}`}
function renderVideos(){const b=ensureVideos();if(!b)return;if(!isProblemSubject()){b.innerHTML='';return}const q=encodeURIComponent(`${state.subject} ${state.level} ${videoTopic()} شرح عربي المنهاج السوري`),q2=encodeURIComponent(`${state.subject} ${state.level} ${videoTopic()} Arabic subtitles`);b.innerHTML=`<h3>🎥 فيديوهات تشرح هذا الموضوع</h3><p class="note">مرتبطة بالمادة والصفحة الحالية، مع أولوية للشرح العربي.</p><a class="btn primary" target="_blank" rel="noopener" href="https://www.youtube.com/results?search_query=${q}">فيديوهات بالعربية</a> <a class="btn soft" target="_blank" rel="noopener" href="https://www.youtube.com/results?search_query=${q2}">مع ترجمة عربية</a>`}

/* أدوات شبيهة بتطبيقات الدراسة الحديثة لكن مخصصة للرياضيات والفيزياء والكيمياء. */
function ensureCoach(){let b=document.getElementById('scienceCoach');if(b)return b;const side=document.querySelector('#book .side');if(!side)return null;b=document.createElement('div');b.id='scienceCoach';b.style.cssText='margin-top:18px;padding-top:14px;border-top:1px solid #dce8e5';side.appendChild(b);return b}
window.ABU_RENDER_COACH=function(){renderCoach();renderVideos()};
function renderCoach(){const b=ensureCoach();if(!b)return;b.innerHTML=`<h3>🧠 أدوات الدراسة</h3><p class="note">تعتمد على المادة والصفحة المفتوحة حالياً.</p><div class="actions" style="justify-content:flex-start"><button class="btn soft" onclick="scienceAction('explain')">📖 اشرح الدرس</button><button class="btn soft" onclick="scienceAction('solve')">✏️ حل التمارين</button><button class="btn soft" onclick="scienceAction('hint')">💡 أعطني تلميحاً</button><button class="btn soft" onclick="scienceAction('steps')">🧩 حل خطوة بخطوة</button><button class="btn soft" onclick="scienceAction('similar')">📝 تمرين مشابه</button><button class="btn soft" onclick="scienceAction('check')">✅ تحقق من حلي</button></div>`}
function cleanAIAnswer(s){return String(s||'').replace(/```[a-z]*\n?/gi,'').replace(/```/g,'').replace(/^\s*#{1,6}\s*/gm,'').replace(/\*\*/g,'').replace(/__/g,'').replace(/\$/g,'').replace(/\\times/g,'×').replace(/\\cdot/g,'·').replace(/\\div/g,'÷').replace(/\\pm/g,'±').replace(/\\leq/g,'≤').replace(/\\geq/g,'≥').replace(/\\neq/g,'≠').replace(/\\sqrt\{([^{}]+)\}/g,'√($1)').replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g,'($1)/($2)').replace(/\\\[/g,'').replace(/\\\]/g,'').replace(/\\\(/g,'').replace(/\\\)/g,'').replace(/\n{3,}/g,'\n\n').trim()}
async function sendCoach(prompt){addMsg(prompt,'user');const w=document.createElement('div');w.className='msg ai';w.style.whiteSpace='pre-wrap';w.style.lineHeight='1.9';w.style.textAlign='right';w.textContent='جارٍ قراءة الصفحة والتفكير...';chatlog.appendChild(w);try{const text=await currentText();const format='\n\nتعليمات تنسيق إلزامية: أجب كنص عربي واضح فقط دون Markdown ودون رموز # أو ** أو $ ودون LaTeX. استخدم الرموز الرياضية العادية مثل × ÷ = + − √. افصل كل سؤال عن الآخر بسطر فارغ. لكل تمرين استخدم هذا الترتيب: السؤال، المطلوب، الحل خطوة بخطوة، ثم الإجابة النهائية. اجعل كل خطوة في سطر مستقل ولا تكتب كتلة نص طويلة.';const r=await fetch('https://abu-shreek-api.ahmad-aljarad.workers.dev/api/ask',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:prompt+format,level:state.level,book:state.subject,page:state.page,pageText:text})});const j=await r.json();w.textContent=cleanAIAnswer(j.answer||j.error||'لم تصل إجابة.')}catch(e){w.textContent='تعذر قراءة الصفحة أو الاتصال بالذكاء الاصطناعي.'}}
window.ABU_ASK_SELECTED=async function(imageCanvas){
 addMsg('اشرح الجزء المحدد من الصفحة الحالية','user');
 const w=document.createElement('div');w.className='msg ai';w.style.whiteSpace='pre-wrap';w.textContent='جارٍ قراءة الجزء المحدد...';chatlog.appendChild(w);
 try{
  const reader=await worker(),result=await reader.recognize(imageCanvas);
  const selected=norm(result?.data?.text);
  if(selected.length<12){w.textContent='لم أتمكن من قراءة الجزء المحدد بوضوح. جرّب تحديد مساحة أكبر تحتوي على نص واضح.';return}
  w.textContent='جارٍ إعداد الشرح...';
  const q='اشرح هذا المقتطف المحدد من الصفحة '+state.page+' من كتاب '+state.subject+' بلغة عربية سهلة. استخدم النص التالي فقط، وإذا كانت الكلمات غير واضحة فاذكر ذلك ولا تخمّن: '+selected;
  const response=await fetch('https://abu-shreek-api.ahmad-aljarad.workers.dev/api/ask',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:q,level:state.level,book:state.subject,page:state.page,pageText:selected})});
  const data=await response.json();w.textContent=cleanAIAnswer(data.answer||data.error||'لم تصل إجابة.');
 }catch(e){console.error('[selected page]',e);w.textContent='تعذّر قراءة الجزء المحدد. حاول مجدداً.'}
};
window.ABU_EXAM_QUESTIONS=async function(){
 await sendCoach('اعتماداً على نص الصفحة الحالية فقط، أنشئ 5 أسئلة امتحانية متنوعة ومناسبة لمستوى الطالب مع إجابات نموذجية مختصرة. لا تخترع معلومات من خارج الصفحة. إذا كان النص غير كافٍ، وضّح ذلك.');
};
window.scienceAction=async function(type){const custom=norm(question.value);const prompts={explain:'اشرح محتوى هذه الصفحة ببساطة، وركز على المفاهيم والقوانين والأمثلة المهمة دون الخروج عن محتواها.',solve:'استخرج التمارين أو المسائل الظاهرة في هذه الصفحة وحلها بالتدرج. اذكر رقم السؤال إن أمكن.',hint:`أعطني تلميحاً فقط دون إعطاء الحل النهائي${custom?' للسؤال التالي: '+custom:' لأهم تمرين في الصفحة الحالية'}.`,steps:`حل خطوة بخطوة مع توضيح لماذا نقوم بكل خطوة${custom?' للسؤال التالي: '+custom:' لتمرين مناسب من الصفحة الحالية'}.`,similar:'أنشئ تمريناً جديداً مشابهاً لموضوع وتمارين الصفحة الحالية، مناسباً لنفس المستوى. لا تعط الحل مباشرة؛ انتظر محاولة الطالب.',check:`تحقق من حل الطالب التالي، وحدد أين الخطأ إن وجد ثم صححه خطوة بخطوة: ${custom||'اطلب مني أولاً أن أكتب حلي في مربع السؤال.'}`};question.value='';await sendCoach(prompts[type]||prompts.explain)};

/* في المواد العلمية نستبدل البطاقات والاختيار المتعدد بأدوات حل وفهم. */
function configureModes(){const modes=document.querySelectorAll('#module .mode');if(modes.length<3)return;const cards=modes[1],mcq=modes[2];if(isProblemSubject()){
 cards.onclick=()=>openScienceMode('solve');cards.querySelector('.icon').textContent='✏️';cards.querySelector('h2').textContent='حل وتمارين';cards.querySelector('p').textContent='حل مسائل الصفحة الحالية مع شرح واضح خطوة بخطوة';const p1=cards.querySelector('.progress');if(p1)p1.style.display='none';
 mcq.onclick=()=>openScienceMode('practice');mcq.querySelector('.icon').textContent='🧠';mcq.querySelector('h2').textContent='تدريب ذكي';mcq.querySelector('p').textContent='تلميحات، تمارين مشابهة، وتصحيح حلك';const p2=mcq.querySelector('.progress');if(p2)p2.style.display='none';
 }else{
 cards.onclick=()=>openCards();cards.querySelector('.icon').textContent='🗂️';cards.querySelector('h2').textContent='البطاقات التعليمية';cards.querySelector('p').textContent='بطاقات مولدة من الدرس والصفحة الحالية فقط';const p1=cards.querySelector('.progress');if(p1)p1.style.display='block';
 mcq.onclick=()=>openMCQ();mcq.querySelector('.icon').textContent='✅';mcq.querySelector('h2').textContent='اختيار من متعدد';mcq.querySelector('p').textContent='أسئلة من الدرس والصفحة الحالية فقط';const p2=mcq.querySelector('.progress');if(p2)p2.style.display='block';}}
const originalOpenSubject=window.openSubject;
window.openSubject=function(s){originalOpenSubject(s);configureModes()};
window.openScienceMode=async function(kind){await openBook();setTimeout(()=>scienceAction(kind==='solve'?'solve':'similar'),100)};

window.openBook=async function(){show('book');chatlog.innerHTML='';pdfCanvas.style.display='block';bookHint.textContent='جارٍ تحميل الكتاب...';try{const pdf=await loadPdf();state.page=Math.max(1,Math.min(state.page||1,pdf.numPages));await renderPage()}catch(e){pdfCanvas.style.display='none';bookHint.textContent=e.message==='NO_BOOK'?'كتاب هذه المادة لم يتم ربطه بعد.':'تعذر تحميل الكتاب حالياً. حاول مرة أخرى.';console.error('[book]',e)}};
window.renderPage=async function(){if(!state.pdf)return;const p=await state.pdf.getPage(state.page),v=p.getViewport({scale:1.25}),c=pdfCanvas,x=c.getContext('2d');c.width=v.width;c.height=v.height;await p.render({canvasContext:x,viewport:v}).promise;pageLabel.textContent=`صفحة ${state.page} من ${state.pdf.numPages}`;try{state.pageText=await digitalText(state.page)}catch{state.pageText=''}bookHint.textContent='';renderCoach();renderVideos()};

if(typeof window.askAI==='function'){const originalAsk=window.askAI;window.askAI=async function(){if(!norm(state.pageText).length){try{bookHint.textContent='جارٍ قراءة الصفحة الحالية...';state.pageText=await currentText();bookHint.textContent=''}catch(e){bookHint.textContent=''}}return originalAsk()}}

/* التخزين أصبح خاصاً بالمادة + الصفحة لمنع ظهور أسئلة مادة أو صفحة أخرى. */
window.cardsForSubject=function(){try{return JSON.parse(localStorage.getItem(pageKey('generatedCards'))||'[]')}catch{return[]}};
async function autoFindTopicRange(f,topic,mode){
 const locator=window.ABU_LESSON_SOURCE;
 const total=await locator.pageCount(f);
 const titles=(window.ABU_DRAFT_TOC?.[state.level+'|'+state.subject]||[]).filter(x=>!x.book||x.book===f).map(x=>x.title);
 const normTitle=x=>String(x||'').normalize('NFKC').replace(/[\u064B-\u065F\u0670\u0640]/g,'').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/\s+/g,' ').trim();
 const wanted=normTitle(topic),others=titles.map(normTitle).filter(x=>x!==wanted&&x.length>5);
 let start=0,end=0;
 for(let n=1;n<=total;n++){
  const status='جارٍ البحث تلقائياً عن محتوى الدرس: '+n+' / '+total;
  if(mode==='cards')flash.textContent=status;else mcqQuestion.textContent=status;
  let txt='';try{txt=normTitle(await locator.pageText(f,n))}catch(e){continue}
  const head=txt.slice(0,450);
  if(!start){
   if(head.includes(wanted))start=n;
  }else if(n>start&&others.some(x=>head.includes(x))){
   end=n-1;break;
  }
  if(start&&n-start>=12){end=n;break}
 }
 if(!start)throw Error('لم أتمكن من العثور على عنوان الدرس داخل صفحات الكتاب تلقائياً.');
 return {start,end:end||Math.min(total,start+12),book:f,topic};
}
const PREMADE_CARDS_URL='./data/lesson-cards.json?v=20261023-717';
let premadeCardsPromise;
async function premadeCards(){
 if(!premadeCardsPromise)premadeCardsPromise=fetch(PREMADE_CARDS_URL,{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('CARD_LIBRARY_UNAVAILABLE');return r.json()}).catch(e=>{premadeCardsPromise=null;throw e});
 return premadeCardsPromise;
}
async function loadPremadeTopicCards(){
 if(!studyTopic)return null;
 const db=await premadeCards();
 const normalizeTitle=x=>String(x||'').normalize('NFKC').replace(/[\u064B-\u065F\u0670\u0640]/g,'').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/\s+/g,' ').trim();
 const lesson=(db.lessons||[]).find(x=>x.level===state.level&&x.subject===state.subject&&normalizeTitle(x.topic)===normalizeTitle(studyTopic)&&(!x.book||x.book===(studyBook||file())));
 if(!lesson||lesson.status!=='verified'||!Array.isArray(lesson.cards)||!lesson.cards.length)return null;
 const cards=lesson.cards.filter(x=>Array.isArray(x)&&x.length>=2&&x[0]&&x[1]);
 if(!cards.length)return null;
 localStorage.setItem(pageKey('generatedCards'),JSON.stringify(cards));
 return cards;
}
async function generate(mode,force=false){
 if(isProblemSubject()&&!studyTopic)throw new Error('SCIENCE_MODE');
 const sk=pageKey(mode==='cards'?'generatedCards':'generatedMCQ');
 let previous=[];try{previous=JSON.parse(localStorage.getItem(sk)||'[]')}catch{}
 if(!force&&previous.length)return previous;
 const src=studyTopic?await (async()=>{
  const locator=window.ABU_LESSON_SOURCE;if(!locator)throw Error('LESSON_INDEX_UNAVAILABLE');
  const f=studyBook||file();if(!f)throw Error('BOOK_IMAGES_UNAVAILABLE');
  const sourceKey=key('verified-source:v3:'+f+':'+studyTopic+':'+(selectedVerifiedLesson?.start||''));
  let saved=null;try{saved=JSON.parse(sessionStorage.getItem(sourceKey)||'null')}catch{}
  if(saved?.text?.length>80)return saved.text;
  const verified=(selectedVerifiedLesson&&selectedVerifiedLesson.title===studyTopic&&(!selectedVerifiedLesson.book||selectedVerifiedLesson.book===f)?selectedVerifiedLesson:null)||(window.ABU_VERIFIED_TOC?.[state.level+'|'+state.subject]||[]).find(x=>x.title===studyTopic&&x.verified===true&&x.scope!=='unit'&&Number.isInteger(x.start)&&Number.isInteger(x.end)&&x.end>=x.start&&x.end-x.start<=14&&(!x.book||x.book===f));
  let range=verified?{start:verified.start,end:verified.end,book:f,topic:studyTopic}:manualRanges[f+'|'+studyTopic];
  if(!range){try{range=await locator.findLesson(f,studyTopic,s=>{if(mode==='cards')flash.textContent=s;else mcqQuestion.textContent=s})}catch(err){if(['LESSON_NOT_INDEXED','LESSON_END_UNVERIFIED','LESSON_START_UNVERIFIED'].includes(String(err.message)))range=await autoFindTopicRange(f,studyTopic,mode);else throw err}manualRanges[f+'|'+studyTopic]=range}
  const pages=[];for(let n=range.start;n<=range.end;n++){const t=await locator.pageText(f,n);if(t.length>60)pages.push('صفحة '+n+' من الكتاب:\\n'+t)}
  if(!pages.length)throw Error('NO_TEXT');
  const text='المصدر الحصري هو الصفحات التالية من الكتاب. الدرس: '+studyTopic+'. لا تستخدم معلومات من خارجها.\\n'+pages.join('\\n\\n');
  try{sessionStorage.setItem(sourceKey,JSON.stringify({text}))}catch{}
  return text;
 })():await studySource();
 if(src.length<80)throw Error('NO_TEXT');
 const target=mode==='cards'?(force?10:25):10;
 const collected=force?[...previous]:[];
 const seen=new Set(collected.map(x=>norm(mode==='cards'?x[0]:x.q).toLowerCase()));
 const generic=/ما هو الموضوع الأساسي|ماذا يدرس الطالب|ما هي المادة|ما هو الهدف من دراسة|ما هو موضوع مادة|ماذا تعرف عن مادة|الجدول المذكور|الشكل المذكور|حسب النص|في النص|في الفقرة|في الصورة|المذكور في النص|الموضوع المذكور|ما الذي يوضحه الجدول/i;
 for(let attempt=0;attempt<(mode==='cards'?(force?3:6):3)&&collected.length<(force?previous.length+target:target);attempt++){
  const remaining=(force?previous.length+target:target)-collected.length;
  const used=collected.map(x=>mode==='cards'?x[0]:x.q).slice(-35);
  const instruction='لكل بطاقة اذكر اسم المفهوم العلمي صراحةً في السؤال، ولا تستخدم عبارات مثل حسب النص أو الجدول المذكور. لا تخترع رقم صفحة؛ أعد page فقط إن كان ظاهراً في المصدر. أنشئ '+Math.min(10,remaining+3)+' '+(mode==='cards'?'بطاقات سؤال وجواب':'أسئلة اختيار من متعدد')+' جديدة متنوعة ومحددة من النص فقط عن '+(studyTopic||state.subject)+'. تجنب الأسئلة العامة والمكررة. أسئلة مستخدمة يجب عدم تكرارها: '+used.join(' | ')+'. أعد عناصر بصيغة JSON.';
  const r=await fetch('https://abu-shreek-api.ahmad-aljarad.workers.dev/api/study',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode,level:state.level,book:state.subject,page:studyTopic?0:state.page,topic:studyTopic||undefined,sourceText:src+'\\n\\n'+instruction})});
  let j={};try{j=await r.json()}catch{throw Error('BAD_JSON')}
  if(!r.ok){if(collected.length>previous.length)break;throw Error(j.error||'AI_ERROR')}
  if(j.error){console.warn('[study] API error',j.error);if(collected.length>previous.length)break;throw Error(String(j.error).slice(0,160))}
  let raw=j.items??j.cards??j.questions??j.flashcards??j.data?.items??j.data?.cards??j.data?.questions??j.result?.items??j.result?.cards??j.result?.questions??j.answer??j.text??j.result??[];
  if(typeof raw==='string'){
   const cleaned=raw.replace(/^\s*```(?:json)?\s*/i,'').replace(/\s*```\s*$/,'').trim();
   try{raw=JSON.parse(cleaned)}catch{
    const begin=cleaned.indexOf('['),end=cleaned.lastIndexOf(']');
    if(begin>=0&&end>begin)try{raw=JSON.parse(cleaned.slice(begin,end+1))}catch{raw=[]}
    else raw=[];
   }
  }
  if(raw&&typeof raw==='object'&&!Array.isArray(raw))raw=raw.items??raw.cards??raw.questions??raw.flashcards??raw.data??[];
  if(!Array.isArray(raw))raw=[];
  if(!raw.length)console.warn('[study] Empty/incompatible API response',JSON.stringify(j).slice(0,1200));
  if(typeof raw==='string'){try{raw=JSON.parse(raw.replace(/^\`\`\`(?:json)?\\s*|\\s*\`\`\`$/g,''))}catch{raw=[]}}
  if(!Array.isArray(raw)&&raw&&typeof raw==='object')raw=raw.items??raw.cards??raw.questions??[];
  if(!Array.isArray(raw))raw=[];
  const batch=mode==='cards'?raw.map(x=>Array.isArray(x)?x:[x.front??x.question??x.q??x.term??'',x.back??x.answer??x.a??x.definition??'',x.page??x.sourcePage??null]).filter(x=>x[0]&&x[1]):raw.map(x=>({q:x.q??x.question??'',o:x.o??x.options??x.choices??[],a:Number(x.answer??x.correctIndex??x.a??0),e:x.e??x.explanation??''})).filter(x=>x.q&&Array.isArray(x.o)&&x.o.length===4);
  for(const item of batch){const question=norm(mode==='cards'?item[0]:item.q);const fingerprint=question.toLowerCase();if(!question||question.length<17||seen.has(fingerprint)||generic.test(question))continue;seen.add(fingerprint);collected.push(item)}
  if(mode==='cards')flash.textContent='تم إنشاء '+(collected.length-previous.length)+' بطاقة جديدة...';
  if(mode==='cards'&&batch.length===0)console.warn('[study] Incompatible generation response',j);
 }
 if(collected.length===previous.length){throw Error('EMPTY')}
 localStorage.setItem(sk,JSON.stringify(collected));
 return collected;
}
function nice(e){const s=String(e?.message||e||'');if(s==='LESSON_RANGE_CANCELLED')return 'تم إلغاء اختيار الصفحات. لم تُنشأ بطاقات.';if(s==='LESSON_RANGE_INVALID')return 'نطاق الصفحات غير صحيح. أدخل مثلاً 25-32 (بحد أقصى 15 صفحة).';if(s==='LESSON_INDEX_UNAVAILABLE')return 'نظام فهرسة الدروس لم يحمّل بعد.';if(s==='BOOK_IMAGES_UNAVAILABLE')return 'صور صفحات الكتاب غير متاحة حالياً.';if(s==='LESSON_NOT_INDEXED')return 'لم أتمكن من تحديد هذا الدرس من فهرس الكتاب آلياً. لن أنشئ بطاقات من معلومات عامة.';if(s==='LESSON_END_UNVERIFIED')return 'وجدت بداية الدرس في الكتاب، لكن لم أتحقق بعد من صفحة نهايته. لن أختلق نطاق صفحات.';if(s==='LESSON_START_UNVERIFIED')return 'تعذّر التحقق من بداية الدرس في صفحات الكتاب.';if(s==='SCIENCE_MODE')return 'لهذه المادة استخدم أدوات الشرح والحل والتدريب الذكي.';if(s==='NO_TEXT')return 'لم أستطع قراءة مادة دراسية كافية من الصفحة الحالية.';if(s==='OCR_LOAD')return 'تعذر تشغيل قارئ الصفحة. تحقق من الاتصال وحاول مجدداً.';if(s==='EMPTY')return 'لم يُرجع الذكاء الاصطناعي بطاقات أو أسئلة صالحة. جرّب مرة أخرى، وإذا تكرر الخطأ سنحتاج فحص استجابة الخادم.';if(s==='BAD_JSON')return 'وصل رد غير صالح من الذكاء الاصطناعي. حاول مرة أخرى.';return s&&s.length<180?s:'تعذر إنشاء المحتوى حالياً. حاول مرة أخرى.'}
window.abuStartTopicCards=function(topic){studyTopic=topic;window.ABU_STUDY_TOPIC=topic;return startTopicCards()};
window.abuStartTopicMCQ=function(topic){studyTopic=topic;window.ABU_STUDY_TOPIC=topic;return startTopicMCQ()};
/* Review missed cards separately for each textbook part and lesson. */
const originalMarkCard=window.markCard;
let reviewingMissed=false;
const missedKey=()=>pageKey('missedCardIndices');
function missedIndices(){
 try{return JSON.parse(localStorage.getItem(missedKey())||'[]').filter(n=>Number.isInteger(n)&&n>=0&&n<cardsForSubject().length)}catch{return[]}
}
function refreshMissedButton(){
 let btn=document.getElementById('abuReviewMissed');
 if(!btn){
  const actions=document.querySelector('#cards .actions');
  if(!actions)return;
  btn=document.createElement('button');btn.id='abuReviewMissed';btn.type='button';btn.className='btn soft';actions.appendChild(btn);
  btn.onclick=()=>{
   const misses=missedIndices();
   if(!misses.length)return;
   reviewingMissed=true;state.cardIndex=misses[0];state.cardFlipped=false;renderCard();
  };
 }
 const misses=missedIndices();
 btn.textContent='راجع البطاقات الصعبة ('+misses.length+')';
 btn.disabled=!misses.length;
}
window.markCard=function(ok){
 const cards=cardsForSubject();
 if(!cards.length)return;
 const current=state.cardIndex%cards.length;
 const misses=new Set(missedIndices());
 if(ok)misses.delete(current);else misses.add(current);
 try{localStorage.setItem(missedKey(),JSON.stringify([...misses].sort((a,b)=>a-b)))}catch{}
 originalMarkCard(ok);
 if(reviewingMissed){
  const remaining=missedIndices();
  if(remaining.length){state.cardIndex=remaining.find(n=>n>current)??remaining[0];state.cardFlipped=false;renderCard()}
  else reviewingMissed=false;
 }
 refreshMissedButton();
};
window.openCards=function(){chooseStudyTopic('cards')};
async function startTopicCards(){reviewingMissed=false;show('cards');refreshMissedButton();cardPct.textContent='0% إنجاز';cardProgress.style.width='0%';document.getElementById('cardCount').textContent='جارٍ تحميل بطاقات هذا الدرس...';state.cardIndex=0;state.cardFlipped=false;flash.textContent='جارٍ فتح البطاقات الجاهزة...';try{const ready=await loadPremadeTopicCards();if(ready){renderCard();refreshMissedButton();return;}const cached=JSON.parse(localStorage.getItem(pageKey('generatedCards'))||'[]');if(cached.length){renderCard();refreshMissedButton();return;}flash.textContent='لم تُضف بطاقات موثقة لهذا الدرس بعد. نحتاج نص الدرس من الكتاب المدرسي أولاً.';document.getElementById('cardCount').textContent='لا توجد بطاقات معتمدة لهذا الدرس بعد';}catch(e){flash.textContent=nice(e);console.error('[cards]',e)}};
window.openMCQ=function(){chooseStudyTopic('mcq')};
async function startTopicMCQ(){show('mcq');state.mcqIndex=0;mcqQuestion.textContent='جارٍ إنشاء أسئلة الموضوع المختار...';mcqOptions.innerHTML='';mcqExplain.textContent='';try{generatedMCQ=await generate('mcq');nextMCQ()}catch(e){mcqQuestion.textContent=nice(e);console.error('[mcq]',e)}};
window.nextMCQ=function(){if(!generatedMCQ.length){try{generatedMCQ=JSON.parse(localStorage.getItem(pageKey('generatedMCQ'))||'[]')}catch{generatedMCQ=[]}}if(!generatedMCQ.length){mcqQuestion.textContent='لا توجد أسئلة بعد.';return}const q=state.currentMCQ=shuffledQuestion(generatedMCQ[state.mcqIndex%generatedMCQ.length]);mcqQuestion.textContent=q.q;mcqOptions.innerHTML='';mcqExplain.textContent='';q.o.forEach((o,i)=>{const b=document.createElement('button');b.className='mcq-option';b.textContent=o;b.onclick=()=>answerMCQ(i,b);mcqOptions.appendChild(b)});state.mcqIndex++;const p=progress('mcq'),n=pct(p);mcqPct.textContent=n+'%';mcqProgress.style.width=n+'%'};
window.regenerateStudy=async function(mode){if(mode==='cards'){flash.textContent='جارٍ إنشاء بطاقات جديدة...';try{const before=cardsForSubject().length;await generate('cards',true);state.cardIndex=before;state.cardFlipped=false;renderCard()}catch(e){const old=cardsForSubject();if(old.length){state.cardIndex=Math.min(state.cardIndex,old.length-1);state.cardFlipped=false;renderCard();alert('لم نتمكن من إضافة بطاقات جديدة. البطاقات السابقة محفوظة. '+nice(e))}else flash.textContent=nice(e)}}else{mcqQuestion.textContent='جارٍ إنشاء أسئلة جديدة...';mcqOptions.innerHTML='';try{generatedMCQ=await generate('mcq',true);state.mcqIndex=0;nextMCQ()}catch(e){mcqQuestion.textContent=nice(e)}}};
})();