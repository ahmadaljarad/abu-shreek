/* أبو شريك: دراسة ذكية من الكتاب + فيديوهات مرتبطة بالدرس */
(function(){
Object.assign(bookFiles,{
'تاسع|اللغة العربية':'9-Arabic.pdf','تاسع|الرياضيات':'9-Algebra.pdf','تاسع|علم الأحياء والأرض':'9-Science.pdf','تاسع|الفيزياء والكيمياء':'9-Physics-Chemistry.pdf','تاسع|التاريخ':'9-History.pdf','تاسع|الجغرافيا':'9-Geography.pdf','تاسع|التربية الوطنية':'9-National.pdf','تاسع|التربية الإسلامية':'9-Islamic.pdf','تاسع|التربية المسيحية':'9-Christianity.pdf','تاسع|الفنون':'9-Art.pdf','تاسع|اللغة الإنكليزية':'9-English-SB.pdf','تاسع|اللغة الفرنسية':'9-French-SB.pdf','تاسع|اللغة الروسية':'9-Russian.pdf','تاسع|التقانة':'9-Technology.pdf','تاسع|الموسيقا':'9-Music.pdf',
'بكالوريا علمي|اللغة العربية':'bac-sci-arabic.pdf','بكالوريا علمي|الرياضيات':'bac-sci-math-1.pdf','بكالوريا علمي|الفيزياء':'bac-sci-physics.pdf','بكالوريا علمي|الكيمياء':'bac-sci-chemistry.pdf','بكالوريا علمي|علم الأحياء':'bac-sci-biology.pdf','بكالوريا علمي|اللغة الإنكليزية':'bac-sci-english-sb.pdf','بكالوريا علمي|اللغة الفرنسية':'bac-sci-french.pdf','بكالوريا علمي|اللغة الروسية':'bac-sci-russian.pdf','بكالوريا علمي|التربية الإسلامية':'bac-sci-islamic.pdf','بكالوريا علمي|التربية المسيحية':'bac-sci-christian.pdf',
'بكالوريا أدبي|اللغة العربية':'bac-lit-arabic.pdf','بكالوريا أدبي|الفلسفة':'bac-lit-philosophy-1.pdf','بكالوريا أدبي|التاريخ':'bac-lit-history.pdf','بكالوريا أدبي|الجغرافيا':'bac-lit-geography.pdf','بكالوريا أدبي|اللغة الإنكليزية':'bac-lit-english-sb.pdf','بكالوريا أدبي|اللغة الفرنسية':'bac-lit-french.pdf','بكالوريا أدبي|اللغة الروسية':'bac-lit-russian.pdf','بكالوريا أدبي|التربية الإسلامية':'bac-lit-islamic.pdf','بكالوريا أدبي|التربية المسيحية':'bac-lit-christian.pdf'});
let generatedMCQ=[];
const pdfUrl=f=>'/api/book?file='+encodeURIComponent(f);
const pdfOptions=f=>({url:pdfUrl(f),withCredentials:false,disableRange:false,disableStream:false,disableAutoFetch:true,rangeChunkSize:262144});
const norm=s=>String(s||'').replace(/\s+/g,' ').trim();

function ensureVideoBox(){
 let box=document.getElementById('lessonVideos');if(box)return box;
 const side=document.querySelector('#book .side');if(!side)return null;
 box=document.createElement('div');box.id='lessonVideos';box.style.cssText='margin-top:18px;padding-top:14px;border-top:1px solid #dce8e5';side.appendChild(box);return box;
}
function topicFromPage(){
 const t=norm(state.pageText);if(!t)return state.subject;
 const bad=/حقوق|وزارة|تأليف|الطبعة|المؤسسة|الجمهورية|الفهرس|المحتويات/g;
 const words=t.replace(bad,' ').split(' ').filter(x=>x.length>2).slice(0,14);
 return words.join(' ')||state.subject;
}
function renderVideoLinks(){
 const box=ensureVideoBox();if(!box)return;
 const science=['الرياضيات','الفيزياء','الكيمياء','الفيزياء والكيمياء'].includes(state.subject);
 if(!science){box.innerHTML='';return;}
 const topic=topicFromPage();
 const arabic=`${state.level} ${state.subject} ${topic} شرح عربي`;
 const subtitles=`${state.subject} ${topic} شرح subtitles Arabic`;
 const y=q=>'https://www.youtube.com/results?search_query='+encodeURIComponent(q);
 box.innerHTML=`<h3>🎥 فيديوهات تشرح هذا الموضوع</h3><p class="note">نبحث حسب موضوع الصفحة الحالية، مع أولوية للشرح العربي.</p><div class="actions" style="justify-content:flex-start"><a class="btn primary" target="_blank" rel="noopener" href="${y(arabic)}">فيديوهات بالعربية</a><a class="btn soft" target="_blank" rel="noopener" href="${y(subtitles)}">فيديوهات مع ترجمة عربية</a></div>`;
}
window.openBook=async function(){show('book');chatlog.innerHTML='';const f=bookFiles[`${state.level}|${state.subject}`];if(!f){bookHint.textContent='كتاب هذه المادة لم يتم ربطه بعد.';return;}bookHint.textContent='جارٍ تحميل الكتاب...';try{state.pdf=await pdfjsLib.getDocument(pdfOptions(f)).promise;state.page=1;await renderPage();renderVideoLinks();}catch(e){console.error(e);bookHint.textContent='تعذر تحميل الكتاب حالياً.';}};
const oldRender=window.renderPage||renderPage;
window.renderPage=async function(){await oldRender();renderVideoLinks();};

function pageScore(text,n,total){const t=norm(text);if(t.length<100)return-100;let s=Math.min(8,t.length/320);for(const x of ['حقوق التأليف','حقوق الطبع','جميع الحقوق','وزارة التربية','المؤسسة العامة للطباعة','دار النشر','رقم الإيداع','الطبعة','لجنة التأليف','الفهرس','المحتويات'])if(t.includes(x))s-=4;for(const x of ['الدرس','الوحدة','نشاط','أتعلم','أستنتج','تمرين','مثال','تعريف','قانون','تجربة','سؤال','علل','فسر','نتيجة','سبب','مسألة'])if(t.includes(x))s+=1.5;if(n<=4)s-=3;return s;}
async function extractPage(pdf,n){const p=await pdf.getPage(n),tc=await p.getTextContent(),text=norm(tc.items.map(x=>x.str).join(' '));if(p.cleanup)p.cleanup();return text;}
function scanPages(total){const set=new Set();for(let n=1;n<=Math.min(total,35);n++)set.add(n);const step=Math.max(1,Math.floor(total/45));for(let n=36;n<=total;n+=step)set.add(n);return [...set].slice(0,85);}
async function ensureBookSource(){
 const cacheKey=key('bookSource-v8'),cached=localStorage.getItem(cacheKey);if(cached&&cached.length>600)return cached;
 let pdf=state.pdf;if(!pdf){const f=bookFiles[`${state.level}|${state.subject}`];if(!f)throw new Error('كتاب هذه المادة لم يتم ربطه بعد.');pdf=await pdfjsLib.getDocument(pdfOptions(f)).promise;}
 const candidates=[];
 /* إذا كان الطالب فاتح صفحة، نعطي الصفحة الحالية وما حولها أولوية. */
 if(state.page&&state.pdf){for(let n=Math.max(1,state.page-2);n<=Math.min(pdf.numPages,state.page+3);n++){try{const text=await extractPage(pdf,n),score=pageScore(text,n,pdf.numPages)+8;if(score>0)candidates.push({n,text,score});}catch{}}}
 for(const n of scanPages(pdf.numPages)){try{const text=await extractPage(pdf,n),score=pageScore(text,n,pdf.numPages);if(score>0)candidates.push({n,text,score});}catch{}}
 const unique=new Map();for(const c of candidates){const old=unique.get(c.n);if(!old||c.score>old.score)unique.set(c.n,c);}
 const chosen=[...unique.values()].sort((a,b)=>b.score-a.score).slice(0,16).sort((a,b)=>a.n-b.n);
 let source=chosen.map(x=>`صفحة ${x.n}: ${x.text}`).join('\n').slice(0,17500);
 if(source.length<300)throw new Error('هذا الكتاب يبدو مصوراً ولا يحتوي نصاً رقمياً كافياً. سنضيف له قراءة الصفحات المصورة، أما الكتب النصية فتعمل الآن.');
 try{localStorage.setItem(cacheKey,source)}catch{}return source;
}
async function generate(mode){const sourceText=await ensureBookSource();let r;try{r=await fetch('/api/study',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode,level:state.level,book:state.subject,sourceText})});}catch{throw new Error('تعذر الاتصال بخادم أبو شريك.');}let j={};try{j=await r.json()}catch{throw new Error('وصل رد غير مكتمل. حاول مرة أخرى.');}if(!r.ok)throw new Error(j.error||'تعذر إنشاء المحتوى.');if(!Array.isArray(j.items)||!j.items.length)throw new Error('لم يتم إنشاء محتوى دراسي صالح.');return j.items;}
window.openCards=async function(){show('cards');const flash=document.getElementById('flash');flash.textContent='جارٍ تحضير بطاقات '+state.subject+' من الدروس...';try{let cards;const saved=localStorage.getItem(key('generatedCards'));if(saved)cards=JSON.parse(saved);if(!Array.isArray(cards)||!cards.length){const items=await generate('cards');cards=items.filter(x=>x&&x.front&&x.back).map(x=>[String(x.front),String(x.back)]);localStorage.setItem(key('generatedCards'),JSON.stringify(cards));}state.cardIndex=0;state.cardFlipped=false;renderCard();}catch(e){flash.textContent=e.message||'تعذر إنشاء البطاقات.';}};
window.openMCQ=async function(){show('mcq');mcqQuestion.textContent='جارٍ تحضير أسئلة '+state.subject+' من الدروس...';mcqOptions.innerHTML='';try{let items;const saved=localStorage.getItem(key('generatedMCQ'));if(saved)items=JSON.parse(saved);if(!Array.isArray(items)||!items.length){items=await generate('mcq');localStorage.setItem(key('generatedMCQ'),JSON.stringify(items));}generatedMCQ=items.filter(x=>x&&x.question&&Array.isArray(x.options)&&x.options.length===4).map(x=>({q:String(x.question),o:x.options.map(String),a:Number(x.answer),e:String(x.explanation||'')}));state.mcqIndex=0;window.nextMCQ();}catch(e){mcqQuestion.textContent=e.message||'تعذر إنشاء الأسئلة.';}};
window.nextMCQ=function(){if(!generatedMCQ.length){mcqQuestion.textContent='لا توجد أسئلة مولدة بعد.';return;}const base=generatedMCQ[state.mcqIndex++%generatedMCQ.length],q=shuffledQuestion(base);state.currentMCQ=q;mcqQuestion.textContent=q.q;mcqExplain.textContent='';mcqOptions.innerHTML='';q.o.forEach((o,i)=>{const b=document.createElement('button');b.className='mcq-option';b.textContent=o;b.onclick=()=>answerMCQ(i,b);mcqOptions.appendChild(b)});const p=progress('mcq'),n=pct(p);mcqPct.textContent=n+'%';mcqProgress.style.width=n+'%';};
window.regenerateStudy=async function(mode){localStorage.removeItem(key(mode==='cards'?'generatedCards':'generatedMCQ'));for(const v of ['bookSource-v3','bookSource-v4','bookSource-v5','bookSource-v6','bookSource-v7','bookSource-v8'])localStorage.removeItem(key(v));return mode==='cards'?window.openCards():window.openMCQ();};
})();