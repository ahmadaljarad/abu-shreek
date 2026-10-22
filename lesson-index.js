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
  const txt=await pageText(file,p);const lines=txt.split(/\n/);
  for(const line of lines){
   const plain=normalize(line);
   if(!plain.includes(target))continue;
   const nums=[...line.matchAll(/\b(\d{1,3})\b/g)].map(m=>Number(m[1])).filter(n=>n>0&&n<=total);
   for(const n of nums)toc.push({indexPage:p,printed:n});
  }
 }
 if(!toc.length)throw Error('LESSON_NOT_INDEXED');
 // Confirm the actual heading on a page before accepting any candidate.
 for(const entry of toc){
  for(let offset=0;offset<=16;offset++){
   const p=entry.printed+offset;if(p>total)break;
   progress?.('جارٍ التحقق من بداية الدرس: الصفحة '+p);
   const t=await pageText(file,p);
   if(normalize(t).includes(target)){
    // Only the verified beginning is known; do not guess the lesson end.
    throw Error('LESSON_END_UNVERIFIED');
   }
  }
 }
 throw Error('LESSON_START_UNVERIFIED');
}
window.ABU_LESSON_SOURCE={findLesson,pageText,pageCount,fileName};
})();