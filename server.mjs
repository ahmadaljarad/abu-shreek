import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=fileURLToPath(new URL('.', import.meta.url));
const PORT=Number(process.env.PORT||3000);
const OLLAMA_URL='http://127.0.0.1:11434';
const MODEL=process.env.OLLAMA_MODEL||'qwen2.5:3b-instruct-q5_K_S';
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.pdf':'application/pdf','.json':'application/json; charset=utf-8'};
function send(res,status,body,type='application/json; charset=utf-8'){res.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store'});res.end(typeof body==='string'?body:JSON.stringify(body));}
function readBody(req){return new Promise((resolve,reject)=>{let s='';req.on('data',c=>s+=c);req.on('end',()=>resolve(s));req.on('error',reject);});}

async function askOllama(prompt, structured=''){
 const controller=new AbortController();
 const timer=setTimeout(()=>controller.abort(),90000);
 try{
   const r=await fetch(`${OLLAMA_URL}/api/generate`,{
     method:'POST',headers:{'Content-Type':'application/json'},signal:controller.signal,
     body:JSON.stringify({model:MODEL,prompt,stream:false,think:false,...(structured?{format:'json'}:{}),options:{temperature:structured?0.15:0.3,num_predict:structured==='cards'?420:structured==='mcq'?900:320,repeat_penalty:1.18,repeat_last_n:128}})
   });
   const raw=await r.text();
   let j={}; try{j=JSON.parse(raw)}catch{}
   if(!r.ok) throw new Error(j.error||raw||`Ollama HTTP ${r.status}`);
   const answer=String(j.response||'').trim();
   if(!answer) throw new Error('Ollama أعاد إجابة فارغة.');
   return answer;
 } finally { clearTimeout(timer); }
}

const server=http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');
  if(req.method==='GET' && url.pathname==='/api/status'){
    try{const r=await fetch(`${OLLAMA_URL}/api/tags`);const j=await r.json();return send(res,r.ok?200:503,{ok:r.ok,model:MODEL,models:j.models||[]});}
    catch(e){return send(res,503,{ok:false,error:'Ollama غير مشغّل.'});}
  }
  if(req.method==='POST' && url.pathname==='/api/ask'){
    const data=JSON.parse(await readBody(req)||'{}');
    const question=String(data.question||'').trim();
    if(!question)return send(res,400,{error:'السؤال فارغ.'});
    const pageText=String(data.pageText||'').trim().slice(0,12000);
    const prompt=`أنت مساعد تعليمي لمنصة أبو شريك لطلاب المنهاج السوري.\nمهم جداً: أجب بالعربية فقط. لا تعرض تفكيرك الداخلي ولا تكتب بالإنجليزية أو الألمانية.\nالمستوى: ${data.level||'غير محدد'}\nالكتاب: ${data.book||'غير محدد'}\nالصفحة الحالية: ${data.page||'غير محددة'}\nمحتوى الصفحة المستخرج من الكتاب:\n${pageText||'[لم يتمكن القارئ من استخراج نص هذه الصفحة]'}\nإذا كان السؤال يعتمد على صورة أو رسم غير ظاهر في النص المستخرج، قل إنك تحتاج وصف الرسم أو صورة الجزء المطلوب. لا تدّع رؤية الصور التي لم تُرسل إليك.\nأعط جواباً تعليمياً واضحاً ومختصراً ومناسباً للطالب.\n\nسؤال الطالب: ${question}\n\nالجواب بالعربية فقط:`;
    try{const answer=await askOllama(prompt,String(data.structured||''));return send(res,200,{answer});}
    catch(e){return send(res,503,{error:e.name==='AbortError'?'تأخر Ollama أكثر من 90 ثانية.':String(e.message||e)});}
  }
  if(req.method!=='GET')return send(res,405,{error:'Method not allowed'});
  let pathname=decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname);
  const safe=normalize(pathname).replace(/^[/\\]+/,'').replace(/^(\.\.(\/|\\|$))+/,'');
  const path=join(root,safe);
  if(!path.startsWith(root))return send(res,403,'Forbidden','text/plain');
  try{const st=await stat(path);if(!st.isFile())throw new Error();const file=await readFile(path);res.writeHead(200,{'Content-Type':types[extname(path).toLowerCase()]||'application/octet-stream','Cache-Control':'no-store, no-cache, must-revalidate'});res.end(file);}catch{return send(res,404,'Not found','text/plain');}
 }catch(e){console.error('[Server]',e);send(res,500,{error:String(e.message||e)});}
});
server.listen(PORT,()=>console.log(`\nأبو شريك يعمل الآن على: http://localhost:${PORT}\nالنموذج المحلي: ${MODEL}\n`));
