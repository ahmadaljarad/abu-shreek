(()=>{'use strict';
const $=id=>document.getElementById(id);
const questions=[
{q:"She ___ to school every day.",options:["go","goes","going","gone"],a:1,why:"مع she في المضارع البسيط نضيف s للفعل."},
{q:"They ___ football yesterday.",options:["play","played","plays","playing"],a:1,why:"Yesterday تدل على الماضي البسيط."},
{q:"I have lived here ___ 2020.",options:["for","since","at","during"],a:1,why:"Since تُستخدم مع نقطة بداية زمنية محددة."},
{q:"If it rains, we ___ at home.",options:["stay","stayed","will stay","staying"],a:2,why:"الشرط الأول: If + present simple ثم will + base verb."},
{q:"The book ___ by the teacher.",options:["wrote","was written","writes","writing"],a:1,why:"صيغة المبني للمجهول في الماضي: was/were + past participle."},
{q:"He is interested ___ science.",options:["on","at","in","for"],a:2,why:"التعبير الصحيح: interested in."},
{q:"This is the ___ film I have seen.",options:["good","better","best","well"],a:2,why:"نستخدم صيغة التفضيل best بعد the."},
{q:"You ___ smoke in the laboratory.",options:["mustn't","don't have","might","would"],a:0,why:"Mustn't تعبر عن المنع."},
{q:"She asked me where I ___.",options:["live","lived","living","lives"],a:1,why:"في الكلام المنقول يمكن إرجاع زمن المضارع إلى الماضي."},
{q:"By the time we arrived, the train ___.",options:["leaves","has left","had left","leave"],a:2,why:"حدث سبق حدثاً آخر في الماضي: past perfect."}
];
const prompts=["My Future Career","The Importance of Education","Protecting the Environment","Technology in Our Lives","A Memorable Day","Healthy Habits","The Value of Reading","Volunteering in My Community"];
let current=0,correct=0,answered=false;
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function build(){if($('englishCoach'))return;const sec=document.createElement('section');sec.id='englishCoach';sec.className='hidden';sec.innerHTML=`<div class="topbar"><button id="englishBack" class="btn soft" type="button">← طرق الدراسة</button><h2 id="englishCoachTitle"></h2></div><div class="study" style="max-width:900px;margin:auto;line-height:1.9"><p id="englishCoachLevel"></p><div id="englishWritingPanel"><h3>✍️ Writing Practice</h3><p>اختر موضوعاً، حضّر الأفكار، ثم اكتب باللغة الإنكليزية. التدريب إرشادي ولا يُعد تصحيحاً لغوياً آلياً.</p><label for="englishTopic">موضوع الكتابة</label><select id="englishTopic" style="width:100%;padding:12px;margin:8px 0"></select><label for="englishText">Your writing</label><textarea id="englishText" rows="10" style="display:block;width:100%;padding:14px;margin:8px 0" placeholder="Introduction... Body... Conclusion..."></textarea><p id="englishWords"></p><button id="englishCheck" class="btn primary" type="button">مراجعة بنية الكتابة</button><div id="englishFeedback" aria-live="polite"></div></div><div id="englishExercisesPanel"><h3>📘 English Exercises</h3><p>أسئلة تدريبية عامة في القواعد، وليست منقولة حرفياً من الكتاب المدرسي أو الامتحانات الرسمية.</p><p id="englishScore"></p><h3 id="englishQuestion"></h3><div id="englishChoices" class="actions" style="display:flex;flex-direction:column;align-items:stretch"></div><div id="englishExplanation" aria-live="polite"></div><button id="englishNext" class="btn soft" type="button">السؤال التالي ←</button></div></div>`;document.querySelector('main').appendChild(sec);
$('englishBack').onclick=()=>window.ABU_ARABIC_SHOW('module');
$('englishTopic').innerHTML=prompts.map(p=>'<option>'+esc(p)+'</option>').join('');
$('englishText').oninput=()=>{$('englishWords').textContent='عدد الكلمات: '+count($('englishText').value);save()};
$('englishTopic').onchange=load;
$('englishCheck').onclick=()=>{const txt=$('englishText').value.trim(),n=count(txt);$('englishFeedback').textContent=!txt?'اكتب فقرة أولاً.':n<60?'كتبت '+n+' كلمة. حاول توسيع الفكرة بمقدمة وتفاصيل وأمثلة وخاتمة.':'كتبت '+n+' كلمة. تأكد من وجود مقدمة وفقرات مترابطة وخاتمة، وراجع الأزمنة والإملاء وعلامات الترقيم بنفسك.'};
$('englishNext').onclick=()=>{current=(current+1)%questions.length;answered=false;renderQuestion()};
}
function count(s){return(s.trim().match(/\S+/g)||[]).length}
function storageKey(){return'abu:english:writing:'+((window.ABU_ARABIC_CONTEXT||{}).level||'')+':'+$('englishTopic').value}
function save(){try{localStorage.setItem(storageKey(),$('englishText').value)}catch{}}
function load(){try{$('englishText').value=localStorage.getItem(storageKey())||''}catch{$('englishText').value=''}$('englishWords').textContent='عدد الكلمات: '+count($('englishText').value);$('englishFeedback').textContent=''}
function renderQuestion(){const q=questions[current];$('englishScore').textContent='السؤال '+(current+1)+' من '+questions.length+' — الإجابات الصحيحة: '+correct;$('englishQuestion').textContent=q.q;$('englishExplanation').textContent='';$('englishChoices').innerHTML='';q.options.forEach((option,i)=>{const b=document.createElement('button');b.className='btn soft';b.type='button';b.textContent=option;b.onclick=()=>{if(answered)return;answered=true;if(i===q.a)correct++;$('englishExplanation').textContent=(i===q.a?'✅ إجابة صحيحة. ':'❌ الإجابة الصحيحة: '+q.options[q.a]+'. ')+q.why;$('englishScore').textContent='السؤال '+(current+1)+' من '+questions.length+' — الإجابات الصحيحة: '+correct;[...$('englishChoices').children].forEach(x=>x.disabled=true)};$('englishChoices').appendChild(b)})}
window.openEnglishCoach=function(mode='writing'){build();const writing=mode!=='exercises';$('englishWritingPanel').style.setProperty('display',writing?'block':'none','important');$('englishExercisesPanel').style.setProperty('display',writing?'none':'block','important');$('englishCoachTitle').textContent=writing?'✍️ الكتابة باللغة الإنكليزية':'📘 تدريبات اللغة الإنكليزية';$('englishCoachLevel').textContent='المرحلة: '+((window.ABU_ARABIC_CONTEXT||{}).level||'');if(writing)load();else{current=0;correct=0;answered=false;renderQuestion()}window.ABU_ARABIC_SHOW('englishCoach')};
})();