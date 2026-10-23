// Verify the actual baccalaureate catalog, not invented lesson content.
// Run: node scripts/validate-baccalaureate.cjs
const fs=require('node:fs'),vm=require('node:vm');
const books=fs.readFileSync('books-repair.js','utf8');
const toc=fs.readFileSync('verified-toc.js','utf8');
const manifest=JSON.parse(fs.readFileSync('data/bac-sci-release-assets.json','utf8'));
const released=new Set(manifest.assets.filter(x=>x.size>0).map(x=>x.name));
const required=['bac-sci-arabic.pdf','bac-sci-math-1.pdf','bac-sci-math-2.pdf','bac-sci-physics.pdf','bac-sci-chemistry.pdf','bac-sci-biology.pdf','bac-sci-english-sb.pdf','bac-sci-english-ab.pdf','bac-sci-french.pdf','bac-sci-russian.pdf','bac-sci-islamic.pdf','bac-sci-christian.pdf'];
let missingAssets=required.filter(name=>!released.has(name));
if(missingAssets.length){console.error('MISSING RELEASE ASSETS',missingAssets.join(', '));process.exitCode=1}
else console.log('RELEASE ASSETS VERIFIED:',required.length,'PDF files in books-v1');
const window={};
vm.runInNewContext(toc,{window,localStorage:{getItem:()=>null,setItem:()=>{}}},{timeout:5000});
const tracks={
 'بكالوريا علمي':['اللغة العربية','الرياضيات','الفيزياء','الكيمياء','علم الأحياء','اللغة الإنكليزية','اللغة الفرنسية','اللغة الروسية','التربية الإسلامية','التربية المسيحية']
};
let issues=0,indexed=0;
for(const [track,subjects] of Object.entries(tracks)){
 for(const subject of subjects){
  const key=track+'|'+subject,entries=window.ABU_VERIFIED_TOC[key]||[];
  if(!entries.length){console.log('PENDING TOC',key);continue}
  indexed++;
  const seen=new Set();let lastEnd=0;
  for(const e of entries){
   const errs=[];
   if(!e.title||typeof e.title!=='string')errs.push('missing title');
   if(!Number.isInteger(e.start)||!Number.isInteger(e.end)||e.start<1||e.end<e.start)errs.push('invalid page range');
   if(e.book&&!books.includes("'"+e.book+"'"))errs.push('book not in catalogue');
   if(!e.book)console.warn('UNCONFIRMED BOOK',key,e.title);
   if(seen.has(e.title+'|'+e.start))errs.push('duplicate title and start');seen.add(e.title+'|'+e.start);
   if(e.verified!==true&&e.verified!==false)errs.push('verification flag missing');
   if(e.start<=lastEnd)errs.push('page ranges overlap or are unordered');lastEnd=e.end;
   if(!e.source)errs.push('source citation missing');
   if(errs.length){issues++;console.error('FAIL',key,e.title,errs.join(', '))}
  }
  console.log('INDEXED',key,entries.length,'entries');
 }
}
console.log('Scientific baccalaureate:',indexed+'/10 subjects have TOCs;',issues,'structural issues');
console.log('WARNING: a listed book is not proof that the PDF is uploaded or readable.');
if(issues||missingAssets.length)process.exitCode=1;
