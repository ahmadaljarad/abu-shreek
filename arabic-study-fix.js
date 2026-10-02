/* تحسين تجربة اللغة العربية: نص PDF، أدوات دراسة، وإجابات AI نظيفة */
(function(){
'use strict';
const isArabic=()=>state&&state.subject==='اللغة العربية';
const norm=s=>String(s||'').replace(/[\u200e\u200f\u202a-\u202e]/g,'').replace(/[ \t]+/g,' ').replace(/\s*\n\s*/g,'\n').trim();
function clean(s){
  return norm(String(s||'')
    .replace(/```[a-z]*\n?/gi,'').replace(/```/g,'')
    .replace(/^\s*#{1,6}\s*/gm,'')
    .replace(/\*\*/g,'').replace(/__/g,'').replace(/^\s*[-*]\s+/gm,'• ')
    .replace(/[“”]/g,'"').replace(/[‘’]/g,"'")
    .replace(/\n{3,}/g,'\n\n'));
}
function arabicDigitalText(items){
  if(!items||!items.length)return '';
  const rows=[];
  for(const item of items){
    const str=String(item.str||'').trim(); if(!str)continue;
    const y=Math.round((item.transform?.[5]||0)/4)*4;
    let row=rows.find(r=>Math.abs(r.y-y)<=4);
    if(!row){row={y,items:[]};rows.push(row)}
    row.items.push({x:item.transform?.[4]||0,s:str});
  }
  rows.sort((a,b)=>b.y-a.y);
  return rows.map(r=>r.items.sort((a,b)=>b.x-a.x).map(x=>x.s).join(' ')).join('\n').replace(/\s+([،؛؟.!:])/g,'$1').trim();
}
async function betterPageText(){
  try{
    if(!state.pdf)return state.pageText||'';
    const p=await state.pdf.getPage(state.page),t=await p.getTextContent();
    const txt=arabicDigitalText(t.items);
    if(txt.length>50){state.pageText=txt;return txt}
  }catch(e){}
  return state.pageText||'';
}
function ensureTools(){
  let box=document.getElementById('arabicStudyTools');
  const side=document.querySelector('#book .side');
  if(!side)return;
  if(!isArabic()){if(box)box.remove();return}
  if(!box){box=document.createElement('div');box.id='arabicStudyTools';box.style.cssText='margin-top:18px;padding-top:14px;border-top:1px solid #dce8e5';side.appendChild(box)}
  box.innerHTML=`<h3>أدوات اللغة العربية</h3><p class="note">تعمل على الصفحة المفتوحة حالياً.</p><div class="actions" style="justify-content:flex-start"><button class="btn soft" data-ar="explain">شرح الصفحة</button><button class="btn soft" data-ar="summary">تلخيص</button><button class="btn soft" data-ar="ideas">الأفكار الأساسية</button><button class="btn soft" data-ar="words">شرح المفردات</button><button class="btn soft" data-ar="grammar">قواعد وإعراب</button><button class="btn soft" data-ar="questions">أسئلة تدريبية</button></div>`;
  box.querySelectorAll('[data-ar]').forEach(b=>b.onclick=()=>arabicAction(b.dataset.ar));
}
async function ask(q){
  addMsg(q,'user');
  const w=document.createElement('div');w.className='msg ai';w.style.cssText='white-space:pre-wrap;line-height:1.95;text-align:right';w.textContent='جارٍ قراءة الصفحة...';chatlog.appendChild(w);
  try{
    const text=await betterPageText();
    const instruction=`\n\nتعليمات إلزامية للجواب: ابدأ بالجواب مباشرة دون تحية ودون عبارات مثل يا بطل أو بصفتي مساعدك أو منصة أبو شريك. لا تستخدم Markdown ولا # ولا * ولا ** ولا علامات اقتباس للزينة. اكتب بالعربية الواضحة المناسبة لطالب ${state.level}. استخدم فقرات قصيرة وبين كل فقرتين سطر فارغ. إذا كان السؤال عن كلمة فاشرح معناها مباشرة وباختصار. إذا طلب شرح الصفحة أو تلخيصها فاعتمد على النص المرسل فقط ولا تخترع ما لا يظهر فيه. إذا كان النص المستخرج غير واضح فقل بوضوح إن جزءاً من الصفحة لم يُقرأ جيداً.`;
    const r=await fetch('/api/ask',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:q+instruction,level:state.level,book:state.subject,page:state.page,pageText:text})});
    const j=await r.json();w.textContent=clean(j.answer||j.error||'لم تصل إجابة.');
  }catch(e){w.textContent='تعذر قراءة الصفحة أو الاتصال بالذكاء الاصطناعي.'}
}
window.arabicAction=async function(type){
  const custom=norm(question?.value||'');
  const prompts={explain:'اشرح محتوى الصفحة الحالية بلغة بسيطة، وحافظ على ترتيب الأفكار كما تظهر في الصفحة.',summary:'لخّص الصفحة الحالية في فقرات قصيرة وواضحة دون حذف الفكرة الأساسية.',ideas:'استخرج الأفكار الأساسية في الصفحة الحالية ورتبها بوضوح.',words:`اشرح أهم الكلمات أو المفردات الصعبة في الصفحة الحالية${custom?'، وركز خصوصاً على: '+custom:''}.`,grammar:`استخرج ما يمكن شرحه من القواعد أو الإعراب الموجود فعلاً في الصفحة الحالية${custom?'، وأجب أيضاً عن: '+custom:''}.`,questions:'أنشئ أسئلة تدريبية مفيدة من محتوى الصفحة الحالية فقط، ثم ضع الأجوبة في قسم منفصل في النهاية.'};
  if(question)question.value='';await ask(prompts[type]||prompts.explain);
};
function patch(){ensureTools();if(isArabic())betterPageText();}
const oldOpenBook=window.openBook;if(oldOpenBook)window.openBook=async function(){const r=await oldOpenBook.apply(this,arguments);setTimeout(patch,50);return r};
const oldRender=window.renderPage;if(oldRender)window.renderPage=async function(){const r=await oldRender.apply(this,arguments);if(isArabic())await betterPageText();ensureTools();return r};
const oldSubject=window.openSubject;if(oldSubject)window.openSubject=function(){const r=oldSubject.apply(this,arguments);setTimeout(ensureTools,0);return r};
setTimeout(patch,800);
})();