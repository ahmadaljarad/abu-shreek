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
const pageKey=t=>studyTopic?key(t+':booksource:v2:'+studyTopic):key(t+':page:'+state.page);
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
 const topics=TOPIC_SUGGESTIONS[state.subject]||['مراجعة المفاهيم الأساسية','المصطلحات المهمة','أسئلة مراجعة شاملة'];
 const list=document.createElement('div');list.style.cssText='display:grid;grid-template-columns:repeat(auto-fit,minmax(175px,1fr));gap:9px';
 for(const topic of topics){
  const b=document.createElement('button');b.type='button';b.textContent=topic;b.style.cssText='padding:13px;text-align:right;background:#edf8f5;color:#0e6961;border:1px solid #c9e6df;border-radius:10px;font-size:15px;cursor:pointer';
  b.onclick=()=>{studyTopic=topic;overlay.remove();mode==='cards'?startTopicCards():startTopicMCQ()};
  list.appendChild(b);
 }
 box.appendChild(list);
 const note=document.createElement('p');note.style.cssText='font-size:12px;color:#64748b;margin-top:15px';note.textContent='هذه قائمة مواضيع أولية للتجربة، وليست فهرس الكتاب الرسمي. الأسئلة تُولَّد بالذكاء الاصطناعي؛ سنطابق المواضيع مع دروس المنهاج لاحقاً.';box.appendChild(note);
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
async function generate(mode,force=false){
 if(isProblemSubject()&&!studyTopic)throw new Error('SCIENCE_MODE');
 const sk=pageKey(mode==='cards'?'generatedCards':'generatedMCQ');
 let previous=[];try{previous=JSON.parse(localStorage.getItem(sk)||'[]')}catch{}
 if(!force&&previous.length)return previous;
 const src=studyTopic?await (async()=>{
  const locator=window.ABU_LESSON_SOURCE;if(!locator)throw Error('LESSON_INDEX_UNAVAILABLE');
  const f=file();if(!f)throw Error('BOOK_IMAGES_UNAVAILABLE');
  const sourceKey=key('verified-source:v1:'+studyTopic);
  let saved=null;try{saved=JSON.parse(sessionStorage.getItem(sourceKey)||'null')}catch{}
  if(saved?.text?.length>80)return saved.text;
  const range=await locator.findLesson(f,studyTopic,s=>{if(mode==='cards')flash.textContent=s;else mcqQuestion.textContent=s});
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
  let raw=j.items??j.cards??j.questions??j.flashcards??j.data?.items??j.data?.cards??j.data?.questions??j.result?.items??j.result?.cards??j.result?.questions??[];
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
function nice(e){const s=String(e?.message||e||'');if(s==='LESSON_INDEX_UNAVAILABLE')return 'نظام فهرسة الدروس لم يحمّل بعد.';if(s==='BOOK_IMAGES_UNAVAILABLE')return 'صور صفحات الكتاب غير متاحة حالياً.';if(s==='LESSON_NOT_INDEXED')return 'لم أتمكن من تحديد هذا الدرس من فهرس الكتاب آلياً. لن أنشئ بطاقات من معلومات عامة.';if(s==='LESSON_END_UNVERIFIED')return 'وجدت بداية الدرس في الكتاب، لكن لم أتحقق بعد من صفحة نهايته. لن أختلق نطاق صفحات.';if(s==='LESSON_START_UNVERIFIED')return 'تعذّر التحقق من بداية الدرس في صفحات الكتاب.';if(s==='SCIENCE_MODE')return 'لهذه المادة استخدم أدوات الشرح والحل والتدريب الذكي.';if(s==='NO_TEXT')return 'لم أستطع قراءة مادة دراسية كافية من الصفحة الحالية.';if(s==='OCR_LOAD')return 'تعذر تشغيل قارئ الصفحة. تحقق من الاتصال وحاول مجدداً.';if(s==='EMPTY')return 'لم يُرجع الذكاء الاصطناعي بطاقات أو أسئلة صالحة. جرّب مرة أخرى، وإذا تكرر الخطأ سنحتاج فحص استجابة الخادم.';if(s==='BAD_JSON')return 'وصل رد غير صالح من الذكاء الاصطناعي. حاول مرة أخرى.';return s&&s.length<180?s:'تعذر إنشاء المحتوى حالياً. حاول مرة أخرى.'}
window.abuStartTopicCards=function(topic){studyTopic=topic;return startTopicCards()};
window.abuStartTopicMCQ=function(topic){studyTopic=topic;return startTopicMCQ()};
window.openCards=function(){chooseStudyTopic('cards')};
async function startTopicCards(){show('cards');state.cardIndex=0;state.cardFlipped=false;flash.textContent='جارٍ إنشاء بطاقات الموضوع المختار...';try{await generate('cards');renderCard()}catch(e){flash.textContent=nice(e);console.error('[cards]',e)}};
window.openMCQ=function(){chooseStudyTopic('mcq')};
async function startTopicMCQ(){show('mcq');state.mcqIndex=0;mcqQuestion.textContent='جارٍ إنشاء أسئلة الموضوع المختار...';mcqOptions.innerHTML='';mcqExplain.textContent='';try{generatedMCQ=await generate('mcq');nextMCQ()}catch(e){mcqQuestion.textContent=nice(e);console.error('[mcq]',e)}};
window.nextMCQ=function(){if(!generatedMCQ.length){try{generatedMCQ=JSON.parse(localStorage.getItem(pageKey('generatedMCQ'))||'[]')}catch{generatedMCQ=[]}}if(!generatedMCQ.length){mcqQuestion.textContent='لا توجد أسئلة بعد.';return}const q=state.currentMCQ=shuffledQuestion(generatedMCQ[state.mcqIndex%generatedMCQ.length]);mcqQuestion.textContent=q.q;mcqOptions.innerHTML='';mcqExplain.textContent='';q.o.forEach((o,i)=>{const b=document.createElement('button');b.className='mcq-option';b.textContent=o;b.onclick=()=>answerMCQ(i,b);mcqOptions.appendChild(b)});state.mcqIndex++;const p=progress('mcq'),n=pct(p);mcqPct.textContent=n+'%';mcqProgress.style.width=n+'%'};
window.regenerateStudy=async function(mode){if(mode==='cards'){flash.textContent='جارٍ إنشاء بطاقات جديدة...';try{const before=cardsForSubject().length;await generate('cards',true);state.cardIndex=before;state.cardFlipped=false;renderCard()}catch(e){const old=cardsForSubject();if(old.length){state.cardIndex=Math.min(state.cardIndex,old.length-1);state.cardFlipped=false;renderCard();alert('لم نتمكن من إضافة بطاقات جديدة. البطاقات السابقة محفوظة. '+nice(e))}else flash.textContent=nice(e)}}else{mcqQuestion.textContent='جارٍ إنشاء أسئلة جديدة...';mcqOptions.innerHTML='';try{generatedMCQ=await generate('mcq',true);state.mcqIndex=0;nextMCQ()}catch(e){mcqQuestion.textContent=nice(e)}}};
})();