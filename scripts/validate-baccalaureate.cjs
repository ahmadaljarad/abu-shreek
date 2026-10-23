// Verify the actual baccalaureate catalog, not invented lesson content.
// Run: node scripts/validate-baccalaureate.cjs
const fs=require('node:fs'),vm=require('node:vm');
const books=fs.readFileSync('books-repair.js','utf8');
const toc=fs.readFileSync('verified-toc.js','utf8');
const window={};
vm.runInNewContext(toc,{window,localStorage:{getItem:()=>null,setItem:()=>{}}},{timeout:5000});
const tracks={
 'بكالوريا علمي':['اللغة العربية','الرياضيات','الفيزياء','الكيمياء','علم الأحياء','اللغة الإنكليزية','اللغة الفرنسية','اللغة الروسية','التربية الإسلامية','التربية المسيحية'],
 'بكالوريا أدبي':['اللغة العربية','الفلسفة','التاريخ','الجغرافيا','اللغة الإنكليزية','اللغة الفرنسية','اللغة الروسية','التربية الإسلامية','التربية المسيحية']
};
let issues=0,indexed=0;
for(const [track,subjects] of Object.entries(tracks)){
 for(const subject of subjects){
  const key=track+'|'+subject,entries=window.ABU_VERIFIED_TOC[key]||[];
  if(!entries.length){console.log('PENDING TOC',key);continue}
  indexed++;
  const seen=new Set();
  for(const e of entries){
   const errs=[];
   if(!e.title||typeof e.title!=='string')errs.push('missing title');
   if(!Number.isInteger(e.start)||!Number.isInteger(e.end)||e.start<1||e.end<e.start)errs.push('invalid page range');
   if(e.book&& !books.includes("'"+e.book+"'"))errs.push('book not in catalogue');
   if(seen.has(e.title+'|'+e.start))errs.push('duplicate title and start');seen.add(e.title+'|'+e.start);
   if(e.verified!==true&&e.verified!==false)errs.push('verification flag missing');
   if(errs.length){issues++;console.error('FAIL',key,e.title,errs.join(', '))}
  }
  console.log('INDEXED',key,entries.length,'entries');
 }
}
console.log('Baccalaureate:',indexed+'/19 subjects have TOCs;',issues,'structural issues');
console.log('WARNING: a listed book is not proof that the PDF is uploaded or readable.');
if(issues)process.exitCode=1;
