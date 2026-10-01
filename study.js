/* أبو شريك: وظائف الدراسة والكتب */
(function(){
  const BOOKS={
    'تاسع|اللغة العربية':'9-Arabic.pdf','تاسع|الرياضيات':'9-Algebra.pdf','تاسع|علم الأحياء والأرض':'9-Science.pdf','تاسع|الفيزياء والكيمياء':'9-Physics-Chemistry.pdf','تاسع|التاريخ':'9-History.pdf','تاسع|الجغرافيا':'9-Geography.pdf','تاسع|التربية الوطنية':'9-National.pdf','تاسع|التربية الإسلامية':'9-Islamic.pdf','تاسع|التربية المسيحية':'9-Christianity.pdf','تاسع|الفنون':'9-Art.pdf',
    'بكالوريا علمي|اللغة العربية':'bac-sci-arabic.pdf','بكالوريا علمي|الرياضيات':'bac-sci-math-1.pdf','بكالوريا علمي|الفيزياء':'bac-sci-physics.pdf','بكالوريا علمي|الكيمياء':'bac-sci-chemistry.pdf','بكالوريا علمي|علم الأحياء':'bac-sci-biology.pdf','بكالوريا علمي|اللغة الإنكليزية':'bac-sci-english-sb.pdf',
    'بكالوريا أدبي|اللغة العربية':'bac-lit-arabic.pdf','بكالوريا أدبي|الفلسفة':'bac-lit-philosophy-1.pdf','بكالوريا أدبي|التاريخ':'bac-lit-history.pdf','بكالوريا أدبي|الجغرافيا':'bac-lit-geography.pdf','بكالوريا أدبي|اللغة الإنكليزية':'bac-lit-english-sb.pdf'
  };
  Object.assign(bookFiles,BOOKS);
  const bookKey=()=>`${state.level}|${state.subject}`;
  const bookFile=()=>BOOKS[bookKey()]||bookFiles[bookKey()]||'';
  const bookUrl=f=>`/api/book?file=${encodeURIComponent(f)}`;

  async function ensurePdf(){
    const f=bookFile();
    if(!f) throw new Error('NO_BOOK');
    if(state.pdf) return state.pdf;
    if(!window.pdfjsLib) throw new Error('PDFJS');
    state.pdf=await pdfjsLib.getDocument({url:bookUrl(f),disableAutoFetch:false,disableStream:false}).promise;
    return state.pdf;
  }
  async function textOfPage(n){
    const pdf=await ensurePdf();
    const p=await pdf.getPage(n);
    const t=await p.getTextContent();
    return t.items.map(x=>x.str||'').join(' ').replace(/\s+/g,' ').trim();
  }
  async function studySource(){
    const pdf=await ensurePdf();
    let parts=[];
    let start=Math.max(1,Math.min(state.page||1,pdf.numPages));
    const order=[];
    for(let n=start;n<=Math.min(pdf.numPages,start+7);n++) order.push(n);
    if(start>1) for(let n=1;n<=Math.min(pdf.numPages,8);n++) if(!order.includes(n)) order.push(n);
    for(const n of order){
      try{
        const txt=await textOfPage(n);
        if(txt.length>=80) parts.push(txt);
        if(parts.join(' ').length>=5000) break;
      }catch(e){}
    }
    return parts.join('\n').slice(0,6500);
  }

  window.openBook=async function(){
    show('book'); chatlog.innerHTML=''; pdfCanvas.style.display='block';
    bookHint.textContent='جارٍ تحميل الكتاب...';
    try{
      const pdf=await ensurePdf();
      state.page=Math.max(1,Math.min(state.page||1,pdf.numPages));
      await renderPage();
    }catch(e){
      pdfCanvas.style.display='none';
      bookHint.textContent=e.message==='NO_BOOK'?'كتاب هذه المادة لم يتم ربطه بعد.':'تعذر تحميل الكتاب حالياً. حاول مرة أخرى.';
      console.error('[book]',e);
    }
  };

  window.renderPage=async function(){
    if(!state.pdf)return;
    const p=await state.pdf.getPage(state.page),v=p.getViewport({scale:1.25}),c=pdfCanvas,x=c.getContext('2d');
    c.style.display='block'; c.width=v.width;c.height=v.height;
    await p.render({canvasContext:x,viewport:v}).promise;
    pageLabel.textContent=`صفحة ${state.page} من ${state.pdf.numPages}`;
    try{state.pageText=await textOfPage(state.page)}catch(e){state.pageText=''}
    bookHint.textContent=state.pageText?'':'هذه الصفحة لا تحتوي نصاً رقمياً قابلاً للاستخراج.';
  };

  async function generate(mode,force=false){
    const storageKey=key(mode==='cards'?'generatedCards':'generatedMCQ');
    if(!force){
      try{const old=JSON.parse(localStorage.getItem(storageKey)||'[]');if(old.length)return old}catch(e){}
    }
    const src=await studySource();
    if(src.length<80) throw new Error('NO_TEXT');
    const r=await fetch('/api/study',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode,level:state.level,book:state.subject,page:state.page,sourceText:src})});
    let j={}; try{j=await r.json()}catch(e){throw new Error('BAD_JSON')}
    if(!r.ok) throw new Error(j.error||'AI_ERROR');
    const raw=Array.isArray(j.items)?j.items:(Array.isArray(j.cards)?j.cards:(Array.isArray(j.questions)?j.questions:[]));
    let out=[];
    if(mode==='cards') out=raw.map(x=>Array.isArray(x)?x:[x.front||x.question||'',x.back||x.answer||'']).filter(x=>x[0]&&x[1]);
    else out=raw.map(x=>({q:x.q||x.question||'',o:x.o||x.options||[],a:Number.isInteger(x.a)?x.a:Number(x.answer||0),e:x.e||x.explanation||''})).filter(x=>x.q&&x.o.length>=2);
    if(!out.length) throw new Error('EMPTY');
    localStorage.setItem(storageKey,JSON.stringify(out));
    return out;
  }
  function niceError(e){
    const s=String(e&&e.message||e||'');
    if(s==='NO_BOOK')return 'كتاب هذه المادة لم يتم ربطه بعد.';
    if(s==='NO_TEXT')return 'لم أجد نصاً رقمياً كافياً داخل الكتاب لإنشاء أسئلة موثوقة.';
    if(s==='BAD_JSON')return 'وصل رد غير صالح من الذكاء الاصطناعي. حاول مرة أخرى.';
    return s&&s.length<180?s:'تعذر إنشاء المحتوى حالياً. حاول مرة أخرى.';
  }

  window.openCards=async function(){
    show('cards'); state.cardIndex=0;state.cardFlipped=false;flash.textContent='جارٍ تحضير بطاقات من محتوى الكتاب...';
    try{await generate('cards');renderCard()}catch(e){flash.textContent=niceError(e);console.error('[cards]',e)}
  };
  window.openMCQ=async function(){
    show('mcq');state.mcqIndex=0;mcqQuestion.textContent='جارٍ تحضير أسئلة من محتوى الكتاب...';mcqOptions.innerHTML='';mcqExplain.textContent='';
    try{await generate('mcq');nextMCQ()}catch(e){mcqQuestion.textContent=niceError(e);console.error('[mcq]',e)}
  };
  window.nextMCQ=function(){
    let a=[];try{a=JSON.parse(localStorage.getItem(key('generatedMCQ'))||'[]')}catch(e){}
    if(!a.length){mcqQuestion.textContent='لا توجد أسئلة بعد.';return}
    const base=a[state.mcqIndex%a.length];state.currentMCQ=shuffledQuestion(base);const q=state.currentMCQ;
    mcqQuestion.textContent=q.q;mcqOptions.innerHTML='';mcqExplain.textContent='';
    q.o.forEach((opt,i)=>{const b=document.createElement('button');b.className='mcq-option';b.textContent=opt;b.onclick=()=>answerMCQ(i,b);mcqOptions.appendChild(b)});
    const p=progress('mcq'),n=pct(p);mcqPct.textContent=n+'%';mcqProgress.style.width=n+'%';state.mcqIndex++;
  };
  window.regenerateStudy=async function(mode){
    if(mode==='cards'){
      localStorage.removeItem(key('generatedCards'));flash.textContent='جارٍ إنشاء بطاقات جديدة...';state.cardIndex=0;state.cardFlipped=false;
      try{await generate('cards',true);renderCard()}catch(e){flash.textContent=niceError(e)}
    }else{
      localStorage.removeItem(key('generatedMCQ'));mcqQuestion.textContent='جارٍ إنشاء أسئلة جديدة...';mcqOptions.innerHTML='';
      try{await generate('mcq',true);state.mcqIndex=0;nextMCQ()}catch(e){mcqQuestion.textContent=niceError(e)}
    }
  };
})();
