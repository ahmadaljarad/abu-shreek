/* خرائط الجغرافيا: صفحات الكتاب الأصلية وتدريبات مستندة إلى الكتاب */
(()=>{
const maps=[
{title:"خريطة المواقع السياحية والأثرية في سورية",page:203,why:"تساعد على فهم توزع المعالم السياحية والمدن والطرق والمطارات في سورية.",source:"خريطة الكتاب ص 203، وتدريب تحديد المواقع ص 207.",tasks:[["حدّد مدينة تدمر.","في البادية السورية، بمحافظة حمص."],["حدّد رأس شمرا (أوغاريت).","على الساحل السوري قرب اللاذقية."],["حدّد إيبلا (تل مرديخ).","في محافظة إدلب."],["حدّد بصرى الشام.","في محافظة درعا جنوب سورية."],["حدّد ماري.","في وادي الفرات قرب البوكمال."],["حدّد قلعة حلب.","في مدينة حلب شمال سورية."]]},
{title:"خريطة شبكة الطرق البرية في سورية",page:209,why:"تُظهر توزع الطرق وتركزها في الغرب وصلات المحافظات والمناطق الاقتصادية.",source:"خريطة النقل ص 209، وأسئلة الدرس ص 218.",tasks:[["أين تتركز شبكة الطرق البرية؟","في غربي سورية أكثر من المناطق الشرقية."],["حدّد المحور الذي يصل دمشق بحلب.","يمتد عبر حمص وحماة إلى حلب."],["حدّد طريق دمشق–تدمر–دير الزور.","ينطلق من دمشق شرقاً إلى تدمر ثم دير الزور."],["حدّد الطريق الساحلي.","يمتد بين اللاذقية وطرطوس."]]},
{title:"خريطة السكك الحديدية في سورية",page:211,why:"توضح ارتباط المرافئ والمراكز الحضرية والصناعية بخطوط السكك الحديدية.",source:"خريطة السكك الحديدية ص 211، وتدريبات النقل ص 218.",tasks:[["ما المدينة التي يلتقي فيها المحوران الحديديان الرئيسان؟","حلب."],["ما الميناء الذي يتصل بالشبكة الحديدية في الشمال الغربي؟","ميناء اللاذقية."],["حدّد الاتجاه العام للمحور الذي يصل دمشق بحلب.","شمال–جنوب."],["لماذا يعد الربط الحديدي بالمرافئ مهماً؟","لتيسير نقل البضائع بين الموانئ ومناطق الإنتاج والاستهلاك."]]},
{title:"تدريب تحديد عناصر النقل على خريطة سورية",page:218,why:"تدريب تطبيقي من نهاية الدرس على وضع رموز ومواقع النقل في الخريطة.",source:"تدريب الكتاب ص 218.",tasks:[["حدّد ميناءً بحرياً سورياً.","اللاذقية أو طرطوس."],["حدّد مطاراً دولياً.","مطار دمشق الدولي."],["حدّد خطاً للسكك الحديدية.","الخط الواصل بين دمشق وحلب."],["حدّد خطاً لنقل النفط.","خط أنابيب يصل مناطق الإنتاج بمصافي النفط أو مرافئ التصدير."]]}
];
let current=0,task=0,pdf=null,loaded=false;
const el=id=>document.getElementById(id);
async function draw(){
const m=maps[current];el("geoMapTitle").textContent=m.title;el("geoMapWhy").textContent=m.why;el("geoMapSource").textContent=m.source;el("geoMapNumber").textContent=(current+1)+" / "+maps.length;el("geoMapAnswer").classList.add("hidden");task=0;renderTask();
el("geoMapStatus").textContent="جارٍ عرض الخريطة الأصلية من الكتاب...";
try{
 if(!window.pdfjsLib)throw Error("PDF.js unavailable");
 if(!pdf){pdf=await pdfjsLib.getDocument({url:bookLink("bac-lit-geography.pdf"),withCredentials:false}).promise;}
 const p=await pdf.getPage(m.page),v=p.getViewport({scale:1.45}),canvas=el("geoMapCanvas");
 canvas.width=v.width;canvas.height=v.height;await p.render({canvasContext:canvas.getContext("2d"),viewport:v}).promise;
 el("geoMapStatus").textContent="الصفحة "+m.page+" من الكتاب الأصلي. كبّر الصورة للتعرف على الرموز والمواقع.";
}catch(e){el("geoMapStatus").innerHTML='تعذّر تحميل صورة الصفحة. <a target="_blank" rel="noopener" href="'+bookLink("bac-lit-geography.pdf")+'">افتح الكتاب الأصلي</a> وانتقل إلى الصفحة '+m.page;}
}
function renderTask(){const m=maps[current],q=m.tasks[task];el("geoMapTask").textContent="السؤال "+(task+1)+" من "+m.tasks.length+": "+q[0];el("geoMapAnswer").textContent=q[1];el("geoMapAnswer").classList.add("hidden");}
window.openGeographyMaps=function(){if(state.subject!=="الجغرافيا"){alert("هذا القسم متاح حالياً لمادة الجغرافيا فقط.");return;}show("geoMaps");if(!loaded){loaded=true;draw();}};
window.geoMapMove=function(n){current=(current+n+maps.length)%maps.length;draw();};
window.geoMapReveal=function(){el("geoMapAnswer").classList.remove("hidden");};
window.geoMapNextTask=function(){task=(task+1)%maps[current].tasks.length;renderTask();};
})();