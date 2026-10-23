// Tests real catalogue-to-PDF mappings and study-module source invariants.
// Run: node --test tests/bac-sci.test.cjs
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const manifest=JSON.parse(fs.readFileSync('data/bac-sci-release-assets.json','utf8'));
const summaries=JSON.parse(fs.readFileSync('data/bac-sci-extracted/summary.json','utf8'));
const window={};
vm.runInNewContext(fs.readFileSync('verified-toc.js','utf8'),{window,localStorage:{getItem:()=>null,setItem:()=>{}}});
const source=fs.readFileSync('study.js','utf8');
const subjects=['اللغة العربية','الرياضيات','الفيزياء','الكيمياء','علم الأحياء','اللغة الإنكليزية','اللغة الفرنسية','اللغة الروسية','التربية الإسلامية','التربية المسيحية'];
test('all 12 scientific textbooks are present in the release manifest',()=>{
 const actual=new Set(manifest.assets.filter(a=>a.size>0).map(a=>a.name));
 const expected=['arabic','math-1','math-2','physics','chemistry','biology','english-sb','english-ab','french','russian','islamic','christian'].map(x=>'bac-sci-'+x+'.pdf');
 for(const file of expected)assert.ok(actual.has(file),file);
});
test('source PDF extraction reports every book without missing records',()=>{
 const names=new Set(summaries.map(x=>x.file));
 for(const a of manifest.assets)assert.ok(names.has(a.name),a.name);
});
test('each indexed lesson has a valid PDF page interval and a source',()=>{
 const pageCounts=Object.fromEntries(summaries.filter(x=>x.status==='extracted').map(x=>[x.file,x.pdf_pages]));
 for(const subject of subjects){
  const entries=window.ABU_VERIFIED_TOC['بكالوريا علمي|'+subject]||[];
  for(const e of entries){
   assert.ok(e.title&&e.source,subject+' missing source/title');
   assert.ok(Number.isInteger(e.start)&&Number.isInteger(e.end)&&e.start>=1&&e.end>=e.start,subject+' invalid pages');
   if(e.book&&pageCounts[e.book])assert.ok(e.end<=pageCounts[e.book],subject+' beyond actual PDF');
  }
 }
});
test('cards and quiz use only selected textbook pages',()=>{
 assert.match(source,/locator\.pageText\(f,n\)/);
 assert.match(source,/if\(!pages\.length\)throw Error\('NO_TEXT'\)/);
 assert.match(source,/const src=studyTopic\?/);
 assert.match(source,/async function startTopicCards\(/);
 assert.match(source,/async function startTopicMCQ\(/);
 assert.match(source,/const verified=\(selectedVerifiedLesson/);
});
test('source code parses as JavaScript',()=>{
 new vm.Script(fs.readFileSync('study.js','utf8'));
 new vm.Script(fs.readFileSync('lesson-index.js','utf8'));
 new vm.Script(fs.readFileSync('books-repair.js','utf8'));
});
