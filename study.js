/* أبو شريك: ربط الكتب والبطاقات والاختبارات بمحتوى الكتاب */
(function(){
  const RELEASE_BASE='https://github.com/ahmadaljarad/abu-shreek/releases/download/books-v1/';
  Object.assign(bookFiles,{
    'تاسع|اللغة العربية':'9-Arabic.pdf','تاسع|الرياضيات':'9-Algebra.pdf','تاسع|علم الأحياء والأرض':'9-Science.pdf','تاسع|الفيزياء والكيمياء':'9-Physics-Chemistry.pdf','تاسع|التاريخ':'9-History.pdf','تاسع|الجغرافيا':'9-Geography.pdf','تاسع|التربية الوطنية':'9-National.pdf','تاسع|التربية الإسلامية':'9-Islamic.pdf','تاسع|التربية المسيحية':'9-Christianity.pdf','تاسع|الفنون':'9-Art.pdf','تاسع|اللغة الإنكليزية':'9-English-SB.pdf','تاسع|اللغة الفرنسية':'9-French-SB.pdf','تاسع|اللغة الروسية':'9-Russian.pdf','تاسع|التقانة':'9-Technology.pdf','تاسع|الموسيقا':'9-Music.pdf',
    'بكالوريا علمي|اللغة العربية':'bac-sci-arabic.pdf','بكالوريا علمي|الرياضيات':'bac-sci-math-1.pdf','بكالوريا علمي|الفيزياء':'bac-sci-physics.pdf','بكالوريا علمي|الكيمياء':'bac-sci-chemistry.pdf','بكالوريا علمي|علم الأحياء':'bac-sci-biology.pdf','بكالوريا علمي|اللغة الإنكليزية':'bac-sci-english-sb.pdf','بكالوريا علمي|اللغة الفرنسية':'bac-sci-french.pdf','بكالوريا علمي|اللغة الروسية':'bac-sci-russian.pdf','بكالوريا علمي|التربية الإسلامية':'bac-sci-islamic.pdf','بكالوريا علمي|التربية المسيحية':'bac-sci-christian.pdf',
    'بكالوريا أدبي|اللغة العربية':'bac-lit-arabic.pdf','بكالوريا أدبي|الفلسفة':'bac-lit-philosophy-1.pdf','بكالوريا أدبي|التاريخ':'bac-lit-history.pdf','بكالوريا أدبي|الجغرافيا':'bac-lit-geography.pdf','بكالوريا أدبي|اللغة الإنكليزية':'bac-lit-english-sb.pdf','بكالوريا أدبي|اللغة الفرنسية':'bac-lit-french.pdf','بكالوريا أدبي|اللغة الروسية':'bac-lit-russian.pdf','بكالوريا أدبي|التربية الإسلامية':'bac-lit-islamic.pdf','بكالوريا أدبي|التربية المسيحية':'bac-lit-christian.pdf'
  });
  let generatedMCQ=[];
  function directPdfUrl(file){return RELEASE_BASE+encodeURIComponent(file)}
  function pdfOptions(file){return {url:directPdfUrl(file),withCredentials:false,disableRange:false,disableStream:false,disableAutoFetch:false}}

  /* نتجاوز المسار القديم Book/ ومسار Render /api/book: المتصفح يحمل PDF مباشرة من GitHub Release. */
  window.openBook=async function(){
    show('book');chatlog.innerHTML='';
    const f=bookFiles[`${state.level}|${state.subject}`];
    if(!f){bookHint.textContent='كتاب هذه المادة لم يتم ربطه بعد.';return;}
    bookHint.textContent='جارٍ تحميل الكتاب...';
    try{
      state.pdf=await pdfjsLib.getDocument(pdfOptions(f)).promise;
      state.page=1;
      await renderPage();
    }catch(e){
      console.error('[PDF direct]',e);
      bookHint.textContent='تعذر تحميل الكتاب حالياً. تأكد من الاتصال ثم حاول مرة أخرى.';
    }
  };

  async function ensureBookSource(){
    const cacheKey=key('bookSource-v5');
    const cached=localStorage.getItem(cacheKey);
    if(cached&&cached.length>200)return cached;
    let pdf=state.pdf;
    if(!pdf){
      const file=bookFiles[`${state.level}|${state.subject}`];
      if(!file)throw new Error('كتاب هذه المادة لم يتم ربطه بعد.');
      pdf=await pdfjsLib.getDocument(pdfOptions(file)).promise;
    }
    const parts=[];let chars=0;
    /* نقرأ فقط ما يكفي للمحتوى الدراسي ولا نحمل الكتاب داخل ذاكرة خادم Render. */
    for(let n=1;n<=pdf.numPages&&chars<17500;n++){
      const page=await pdf.getPage(n);const tc=await page.getTextContent();
      const text=tc.items.map(x=>x.str).join(' ').replace(/\s+/g,' ').trim();
      if(text){parts.push(`صفحة ${n}: ${text}`);chars+=text.length;}
      if(page.cleanup)page.cleanup();
    }
    const source=parts.join('\n').slice(0,17500);
    if(source.length<80)throw new Error('لم أستطع استخراج نص كافٍ من الكتاب.');
    try{localStorage.setItem(cacheKey,source)}catch{}
    return source;
  }
  async function generate(mode){
    const sourceText=await ensureBookSource();let r;
    try{r=await fetch('/api/study',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode,level:state.level,book:state.subject,sourceText})});}
    catch{throw new Error('تعذر الاتصال بخادم أبو شريك. أعد المحاولة بعد لحظات.');}
    let j={};try{j=await r.json()}catch{}
    if(!r.ok)throw new Error(j.error||'تعذر إنشاء المحتوى.');
    if(!Array.isArray(j.items)||!j.items.length)throw new Error('لم يتم إنشاء محتوى صالح.');
    return j.items;
  }
  window.openCards=async function(){show('cards');const flash=document.getElementById('flash');flash.textContent='جارٍ تحضير بطاقات '+state.subject+' من الكتاب...';try{let cards;const saved=localStorage.getItem(key('generatedCards'));if(saved)cards=JSON.parse(saved);if(!Array.isArray(cards)||!cards.length){const items=await generate('cards');cards=items.filter(x=>x&&x.front&&x.back).map(x=>[String(x.front),String(x.back)]);localStorage.setItem(key('generatedCards'),JSON.stringify(cards));}state.cardIndex=0;state.cardFlipped=false;renderCard();}catch(e){console.error(e);flash.textContent=e.message||'تعذر إنشاء البطاقات.';}};
  window.openMCQ=async function(){show('mcq');document.getElementById('mcqQuestion').textContent='جارٍ تحضير أسئلة '+state.subject+' من الكتاب...';document.getElementById('mcqOptions').innerHTML='';try{let items;const saved=localStorage.getItem(key('generatedMCQ'));if(saved)items=JSON.parse(saved);if(!Array.isArray(items)||!items.length){items=await generate('mcq');localStorage.setItem(key('generatedMCQ'),JSON.stringify(items));}generatedMCQ=items.filter(x=>x&&x.question&&Array.isArray(x.options)&&x.options.length===4&&Number.isInteger(Number(x.answer))).map(x=>({q:String(x.question),o:x.options.map(String),a:Number(x.answer),e:String(x.explanation||'')}));state.mcqIndex=0;window.nextMCQ();}catch(e){console.error(e);document.getElementById('mcqQuestion').textContent=e.message||'تعذر إنشاء الأسئلة.';}};
  window.nextMCQ=function(){if(!generatedMCQ.length){document.getElementById('mcqQuestion').textContent='لا توجد أسئلة مولدة بعد.';return;}const base=generatedMCQ[state.mcqIndex++%generatedMCQ.length];const q=shuffledQuestion(base);state.currentMCQ=q;document.getElementById('mcqQuestion').textContent=q.q;document.getElementById('mcqExplain').textContent='';const box=document.getElementById('mcqOptions');box.innerHTML='';q.o.forEach((o,i)=>{const b=document.createElement('button');b.className='mcq-option';b.textContent=o;b.onclick=()=>answerMCQ(i,b);box.appendChild(b)});const p=progress('mcq'),n=pct(p);document.getElementById('mcqPct').textContent=n+'%';document.getElementById('mcqProgress').style.width=n+'%';};
  window.regenerateStudy=async function(mode){localStorage.removeItem(key(mode==='cards'?'generatedCards':'generatedMCQ'));for(const v of ['bookSource-v3','bookSource-v4','bookSource-v5'])localStorage.removeItem(key(v));if(mode==='cards')return window.openCards();return window.openMCQ();};
})();