// Automated integrity checks for the published lesson catalogue.
// Run: node scripts/validate-grade9.cjs
const fs=require('node:fs'),vm=require('node:vm');
const src=fs.readFileSync('verified-toc.js','utf8');
const window={};vm.runInNewContext(src,{window,localStorage:{getItem:()=>null,setItem:()=>{}}},{timeout:5000});
// Detect silent overwrites before evaluating the catalogue.
const assignments=[...src.matchAll(/window\.ABU_VERIFIED_TOC\[['"]([^'"]+)['"]\]\s*=/g)].map(m=>m[1]);
const duplicates=assignments.filter((name,i)=>assignments.indexOf(name)!==i);
if(duplicates.length){console.error('Duplicate catalogue assignments:',[...new Set(duplicates)].join(', '));process.exitCode=1}
const subjects=['الرياضيات','اللغة العربية','الفنون','التاريخ','الجغرافيا','التربية الوطنية','الفيزياء والكيمياء','التربية الإسلامية','التربية المسيحية','علم الأحياء والأرض','اللغة الإنكليزية','اللغة الفرنسية','اللغة الروسية','الموسيقا','التقانة'];
let failures=0,lessons=0,covered=0;
for(const subject of subjects){
 const key='تاسع|'+subject,entries=window.ABU_VERIFIED_TOC[key]||[];
 if(!entries.length){console.log('PENDING',subject);continue}
 covered++;const seen=new Set();let prev=0;
 for(const e of entries){
  const errors=[];
  if(!e.title||typeof e.title!=='string')errors.push('missing title');
  if(!Number.isInteger(e.start)||!Number.isInteger(e.end)||e.start<1||e.end<e.start)errors.push('invalid page range');
  if(!e.book||!/^9-/i.test(e.book))errors.push('book filename missing');
  if(seen.has(e.title))errors.push('duplicate title');seen.add(e.title);
  if(e.start<=prev)errors.push('overlapping or unordered start');prev=e.end;
  if(e.end-e.start>14&&!e.scope)errors.push('long range needs scope=unit');
  if(errors.length){failures++;console.error('FAIL',subject,e.title,errors.join('; '))}
  lessons++;
 }
 console.log('INDEXED',subject,entries.length,'entries');
}
console.log('Summary:',covered+'/'+subjects.length,'subjects;',lessons,'entries;',failures,'issues');
if(failures)process.exitCode=1;
