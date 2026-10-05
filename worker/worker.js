const RELEASE_BASE = 'https://github.com/ahmadaljarad/abu-shreek/releases/download/books-v1/';
const ALLOWED_ORIGINS = new Set(['https://ahmadaljarad.github.io','http://localhost:3000','http://localhost:5173']);
function cors(request){
  const origin=request.headers.get('Origin')||'';
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.has(origin)?origin:'https://ahmadaljarad.github.io',
    'Vary':'Origin',
    'Access-Control-Allow-Methods':'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers':'Content-Type,Range',
    'Access-Control-Expose-Headers':'Content-Length,Content-Range,Accept-Ranges',
  };
}
function json(request,data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...cors(request)}})}
function source(data){return String(data.sourceText||data.pageText||'').trim().slice(0,7000)}
async function gemini(env,prompt,jsonMode=false){
  if(!env.GEMINI_API_KEY) throw new Error('NO_KEY');
  const models=[env.GEMINI_MODEL||'gemini-3.5-flash-lite','gemini-3.8-flash'];
  let last;
  for(const model of [...new Set(models)]){
    try{
      const url='https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(model)+':generateContent?key='+encodeURIComponent(env.GEMINI_API_KEY);
      const body={contents:[{role:'user',parts:[{text:prompt}]}],generationConfig:{temperature:jsonMode?0.15:0.3,maxOutputTokens:jsonMode?1400:700,...(jsonMode?{responseMimeType:'application/json'}:{})}};
      const r=await fetch(url,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
      const raw=await r.text(); let j={}; try{j=JSON.parse(raw)}catch{}
      if(!r.ok) throw Object.assign(new Error(j?.error?.message||raw||('Gemini HTTP '+r.status)),{status:r.status});
      const answer=(j.candidates?.[0]?.content?.parts||[]).map(p=>p.text||'').join('').trim();
      if(!answer) throw new Error('empty response');
      return answer;
    }catch(e){last=e;if([400,401,403].includes(e.status))break;}
  }
  throw last||new Error('AI unavailable');
}
function friendly(e){
  const s=String(e?.message||e||'');
  if(s==='NO_KEY')return 'مفتاح الذكاء الاصطناعي غير مضبوط على الخادم.';
  if(/API key|invalid key|permission|403|401/i.test(s))return 'مفتاح Gemini غير صالح أو لا يملك الصلاحية.';
  if(/quota|429|503|unavailable|overloaded/i.test(s))return 'خدمة الذكاء الاصطناعي مشغولة أو تجاوزت الحصة حالياً. جرّب لاحقاً.';
  return 'تعذر الحصول على إجابة من الذكاء الاصطناعي حالياً.';
}
function policy(book=''){return `أنت معلم خبير لمنصة أبو شريك. المادة/الكتاب: ${book||'غير محدد'}.
استخدم فقط المعلومات التعليمية الفعلية في المصدر. تجاهل الغلاف وحقوق النشر وأسماء المؤلفين والطباعة والفهرس وأرقام الصفحات إلا إذا كانت موضوع الدرس. اختر الأفكار المهمة للامتحان. لا تخترع معلومات غير موجودة. إذا لم توجد مادة تعليمية كافية فأعد items فارغة.`}

export default {
 async fetch(request,env){
  const url=new URL(request.url);
  if(request.method==='OPTIONS') return new Response(null,{status:204,headers:cors(request)});
  if(request.method==='GET'&&url.pathname==='/api/status'){
    try{return json(request,{ok:true,provider:'Gemini',test:await gemini(env,'أجب بكلمة واحدة فقط: جاهز')})}
    catch(e){return json(request,{ok:false,error:friendly(e)},503)}
  }
  if(request.method==='GET'&&url.pathname==='/api/book'){
    const file=String(url.searchParams.get('file')||'');
    if(!/^[A-Za-z0-9._-]+\.pdf$/i.test(file))return json(request,{error:'اسم ملف الكتاب غير صالح.'},400);
    const headers={'User-Agent':'Abu-Shreek/1.0','Accept':'application/pdf,*/*'};
    const range=request.headers.get('Range'); if(range)headers.Range=range;
    const up=await fetch(RELEASE_BASE+encodeURIComponent(file),{headers,redirect:'follow'});
    if(!up.ok&&up.status!==206)return json(request,{error:'تعذر تحميل الكتاب من المصدر.'},up.status===404?404:502);
    const h=new Headers(cors(request)); h.set('Content-Type',up.headers.get('content-type')||'application/pdf'); h.set('Cache-Control','public, max-age=3600'); h.set('Accept-Ranges',up.headers.get('accept-ranges')||'bytes');
    for(const k of ['content-length','content-range','etag','last-modified']){const v=up.headers.get(k);if(v)h.set(k,v)}
    return new Response(up.body,{status:up.status,headers:h});
  }
  if(request.method==='POST'&&url.pathname==='/api/ask'){
    let data;try{data=await request.json()}catch{return json(request,{error:'طلب غير صالح.'},400)}
    const question=String(data.question||'').trim();if(!question)return json(request,{error:'السؤال فارغ.'},400);
    const prompt=`أنت مساعد تعليمي لمنصة أبو شريك. أجب بالعربية فقط وبمستوى الطالب، مباشرة دون تحية ودون Markdown.
المستوى: ${data.level||'غير محدد'}. المادة: ${data.book||'غير محددة'}. الصفحة: ${data.page||'غير محددة'}.
المصدر المتاح:
${source(data)||'[لا يوجد نص مصدر متاح]'}
إذا توفر نص الصفحة فاعتمد عليه أولاً ولا تدّع أنك رأيت شيئاً غير متاح.
سؤال الطالب: ${question}
الجواب:`;
    try{return json(request,{answer:await gemini(env,prompt)})}catch(e){return json(request,{error:friendly(e)},503)}
  }
  if(request.method==='POST'&&url.pathname==='/api/study'){
    let data;try{data=await request.json()}catch{return json(request,{error:'طلب غير صالح.'},400)}
    const text=source(data);if(text.length<80)return json(request,{error:'لا يوجد نص كافٍ من الكتاب لإنشاء محتوى موثوق.'},400);
    const mcq=data.mode==='mcq';
    const rules=mcq?'أنشئ حتى 5 أسئلة اختيار من متعدد. أعد JSON فقط: {"items":[{"question":"...","options":["...","...","...","..."],"answer":0,"explanation":"..."}]}':'أنشئ حتى 5 بطاقات تعليمية. أعد JSON فقط: {"items":[{"front":"...","back":"..."}]}';
    const prompt=policy(data.book)+'\n'+rules+'\nالمصدر الوحيد:\n'+text;
    try{const raw=await gemini(env,prompt,true);let parsed;try{parsed=JSON.parse(raw)}catch{return json(request,{error:'تعذر قراءة رد الذكاء الاصطناعي.'},502)};return json(request,{items:Array.isArray(parsed?.items)?parsed.items.slice(0,5):[]})}catch(e){return json(request,{error:friendly(e)},503)}
  }
  return json(request,{ok:true,name:'Abu Shreek API'},200);
 }
};