/* Lesson-to-page indexing: never invent a page range or use generic knowledge. */
(function(){
'use strict';
const normalize=s=>String(s||'').normalize('NFKC').replace(/[\u064B-\u065F\u0670\u0640]/g,'').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/\s+/g,' ').trim();
const fileName=()=>window.state?.imageFile||({'بكالوريا علمي|علم الأحياء':'bac-sci-biology.pdf'})[window.state?.level+'|'+window.state?.subject];
const path=(file,n)=>'./book-pages/'+file.replace(/\.pdf$/i,'')+'/'+String(n).padStart(3,'0')+'.webp';
let engine;
async function reader(){
 if(!window.Tesseract){await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';s.onload=resolve;s.onerror=reject;document.head.append(s)})}
 if(!engine)engine=window.Tesseract.createWorker('ara+eng');return engine;
}
async function pageText(file,n){
 const key='abu:lesson-ocr:v1:'+file+':'+n;
 const cached=localStorage.getItem(key);if(cached&&cached.length>40)return cached;
 const img=new Image();img.src=path(file,n);await img.decode();
 const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;canvas.getContext('2d').drawImage(img,0,0);
 const worker=await reader();const result=await worker.recognize(canvas);const text=String(result?.data?.text||'').trim();
 if(text.length>40){try{localStorage.setItem(key,text)}catch{}}
 return text;
}
async function pageCount(file){
 const r=await fetch('./book-pages/'+file.replace(/\.pdf$/i,'')+'/count.txt');
 if(!r.ok)throw Error('BOOK_IMAGES_UNAVAILABLE');const n=Number((await r.text()).trim());
 if(!Number.isInteger(n)||n<1)throw Error('BOOK_IMAGES_UNAVAILABLE');return n;
}
async function findLesson(file,topic,progress){
 const total=await pageCount(file);const target=normalize(topic);
 // Inspect the book's actual table of contents. Never assume printed page numbers equal image indices.
 const toc=[];
 for(let p=2;p<=Math.min(total,18);p++){
  progress?.('جارٍ فحص فهرس الكتاب: '+p+'/18');
  const txt=await pageText(file,p);
  for(const line of txt.split(/\n/)){
   const numbers=[...line.matchAll(/\b(\d{1,3})\b/g)].map(m=>Number(m[1])).filter(n=>n>0&&n<=total);
   if(!numbers.length)continue;
   toc.push({title:normalize(line.replace(/[0-9٠-٩.ـ…]+/g,' ')),printed:numbers[numbers.length-1]});
  }
 }
 const matches=toc.filter(x=>x.title.includes(target));
 if(!matches.length)throw Error('LESSON_NOT_INDEXED');
 const startEntry=matches[0];
 const following=toc.filter(x=>x.printed>startEntry.printed&&x.printed<=startEntry.printed+45).sort((a,b)=>a.printed-b.printed)[0];
 if(!following)throw Error('LESSON_END_UNVERIFIED');
 // Printed page and image index may differ; verify the heading on the actual page.
 for(let offset=0;offset<=16;offset++){
  const start=startEntry.printed+offset,end=following.printed+offset-1;
  if(start<1||end>total||end<start||end-start>20)continue;
  progress?.('جارٍ التحقق من الدرس في صفحة '+start);
  const first=normalize(await pageText(file,start));
  if(!first.includes(target))continue;
  const next=normalize(await pageText(file,end+1));
  const nextTitle=following.title.replace(/\b(\d{1,3})\b/g,'').trim();
  const terms=nextTitle.split(' ').filter(x=>x.length>3);
  if(terms.length&&terms.some(x=>next.includes(x)))return {start,end,book:file,topic};
 }
 throw Error('LESSON_END_UNVERIFIED');
}
async function scanContents(file,progress){
 const total=await pageCount(file),items=[],seen=new Set();
 for(let p=2;p<=Math.min(total,16);p++){
  progress?.('جارٍ قراءة فهرس الكتاب: صفحة '+p);
  let raw='';try{raw=await pageText(file,p)}catch{continue}
  for(const line of raw.split(/\n/)){
   const trimmed=line.trim();
   const match=trimmed.match(/(?:^|\s)([0-9]{1,3})\s*$/);
   if(!match)continue;
   const printed=Number(match[1]);
   const title=trimmed.replace(/[0-9٠-٩]+\s*$/,'').replace(/[.ـ…·•\s]+/g,' ').trim();
   if(title.length<5||title.length>100||printed<1||printed>total||seen.has(title))continue;
   seen.add(title);items.push({title,printed,tocImagePage:p,verified:false});
  }
 }
 return items.sort((a,b)=>a.printed-b.printed);
}
window.ABU_LESSON_SOURCE={findLesson,pageText,pageCount,fileName,scanContents};
})();