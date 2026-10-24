/* خرائط الجغرافيا: صفحات الكتاب الأصلية وتدريبات مستندة إلى الكتاب */
(()=>{
const maps=[
{title:"خريطة المواقع السياحية والأثرية في سورية",page:203,why:"تساعد على فهم توزع المعالم السياحية والمدن والطرق والمطارات في سورية.",source:"خريطة الكتاب ص 203، وتدريب تحديد المواقع ص 207.",tasks:[["حدّد مدينة تدمر.","في البادية السورية، بمحافظة حمص."],["حدّد رأس شمرا (أوغاريت).","على الساحل السوري قرب اللاذقية."],["حدّد إيبلا (تل مرديخ).","في محافظة إدلب."],["حدّد بصرى الشام.","في محافظة درعا جنوب سورية."],["حدّد ماري.","في وادي الفرات قرب البوكمال."],["حدّد قلعة حلب.","في مدينة حلب شمال سورية."],["حدّد مدينة دمشق.","في جنوب غربي سورية."],["حدّد مدينة دير الزور.","شرق سورية على نهر الفرات."],["حدّد مدينة طرطوس.","على الساحل السوري جنوب اللاذقية."]]},
{title:"خريطة شبكة الطرق البرية في سورية",page:209,why:"تُظهر توزع الطرق وتركزها في الغرب وصلات المحافظات والمناطق الاقتصادية.",source:"خريطة النقل ص 209، وأسئلة الدرس ص 218.",tasks:[["أين تتركز شبكة الطرق البرية؟","في غربي سورية أكثر من المناطق الشرقية."],["حدّد المحور الذي يصل دمشق بحلب.","يمتد عبر حمص وحماة إلى حلب."],["حدّد طريق دمشق–تدمر–دير الزور.","ينطلق من دمشق شرقاً إلى تدمر ثم دير الزور."],["حدّد الطريق الساحلي.","يمتد بين اللاذقية وطرطوس."],["ما الذي يدل عليه ازدحام الطرق في غربي سورية؟","ارتفاع تركز السكان والمراكز الاقتصادية والعمرانية."],["ما الطريق الواصل بين دمشق وتدمر؟","يمتد من دمشق باتجاه الشرق إلى مدينة تدمر في البادية."]]},
{title:"خريطة السكك الحديدية في سورية",page:211,why:"توضح ارتباط المرافئ والمراكز الحضرية والصناعية بخطوط السكك الحديدية.",source:"خريطة السكك الحديدية ص 211، وتدريبات النقل ص 218.",tasks:[["ما المدينة التي يلتقي فيها المحوران الحديديان الرئيسان؟","حلب."],["ما الميناء الذي يتصل بالشبكة الحديدية في الشمال الغربي؟","ميناء اللاذقية."],["حدّد الاتجاه العام للمحور الذي يصل دمشق بحلب.","شمال–جنوب."],["لماذا يعد الربط الحديدي بالمرافئ مهماً؟","لتيسير نقل البضائع بين الموانئ ومناطق الإنتاج والاستهلاك."]]},
{title:"تدريب تحديد عناصر النقل على خريطة سورية",page:218,why:"تدريب تطبيقي من نهاية الدرس على وضع رموز ومواقع النقل في الخريطة.",source:"تدريب الكتاب ص 218.",tasks:[["حدّد ميناءً بحرياً سورياً.","اللاذقية أو طرطوس."],["حدّد مطاراً دولياً.","مطار دمشق الدولي."],["حدّد خطاً للسكك الحديدية.","الخط الواصل بين دمشق وحلب."],["حدّد خطاً لنقل النفط.","خط أنابيب يصل مناطق الإنتاج بمصافي النفط أو مرافئ التصدير."]]}
];
let current=0,task=0,pdf=null,loaded=false,zoom=1;
let outline=null;
let renderSeq=0;
function originalPageUrl(page){return bookLink("bac-lit-geography.pdf")+"#page="+page;}
function ensureOriginalLink(){let b=el("geoOriginalPageLink");if(!b){b=document.createElement("a");b.id="geoOriginalPageLink";b.className="btn soft";b.target="_blank";b.rel="noopener noreferrer";b.style.cssText="display:inline-block;margin:12px 0";b.textContent="📖 فتح صفحة الخريطة في الكتاب الأصلي";el("geoMapStatus").after(b);}b.href=originalPageUrl(maps[current].page);}

async function fallbackMap(){
 const canvas=el("geoMapCanvas"),ctx=canvas.getContext("2d");canvas.width=850;canvas.height=670;
 ctx.fillStyle="#eef7fa";ctx.fillRect(0,0,850,670);
 try{if(!outline){const r=await fetch("./data/syria-outline.geojson");if(!r.ok)throw Error("outline");outline=(await r.json()).features[0].geometry.coordinates[0];}
 const project=([lon,lat])=>[90+(lon-35.5)/7.0*670,50+(37.4-lat)/5.2*560];
 ctx.beginPath();outline.forEach((p,i)=>{const [x,y]=project(p);i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.closePath();ctx.fillStyle="#fff7df";ctx.fill();ctx.strokeStyle="#0f766e";ctx.lineWidth=3;ctx.stroke();
 const cities=[["دمشق",36.291,33.513],["حلب",37.161,36.202],["حمص",36.716,34.731],["حماة",36.751,35.132],["اللاذقية",35.776,35.523],["طرطوس",35.886,34.895],["دير الزور",40.141,35.335],["تدمر",38.284,34.560]];
 ctx.font="bold 17px Arial";ctx.textAlign="right";cities.forEach(([name,lon,lat])=>{const [x,y]=project([lon,lat]);ctx.fillStyle="#b45309";ctx.beginPath();ctx.arc(x,y,5,0,Math.PI*2);ctx.fill();ctx.fillStyle="#173d40";ctx.fillText(name,x-9,y-7)});
 ctx.font="bold 22px Arial";ctx.textAlign="center";ctx.fillStyle="#0f766e";ctx.fillText("خريطة سورية التعليمية المبسطة",425,38);
 ctx.font="17px Arial";ctx.fillStyle="#475569";ctx.fillText("بديل تقريبي — ليست صورة الكتاب الأصلي",425,648);
 return true;
 }catch(e){ctx.fillStyle="#334155";ctx.font="20px Arial";ctx.textAlign="center";ctx.fillText("تعذّر تحميل الخريطة المحلية أيضاً",425,335);return false;}
}

const el=id=>document.getElementById(id);
async function draw(){
const seq=++renderSeq;
const m=maps[current];ensureOriginalLink();el("geoMapTitle").textContent=m.title;el("geoMapWhy").textContent=m.why;el("geoMapSource").textContent=m.source;el("geoMapNumber").textContent=(current+1)+" / "+maps.length;el("geoMapAnswer").classList.add("hidden");task=0;renderTask();
el("geoMapStatus").textContent="جارٍ عرض الخريطة الأصلية من الكتاب...";
try{
 if(!window.pdfjsLib)throw Error("PDF.js unavailable");
 if(!pdf){pdf=await pdfjsLib.getDocument({url:bookLink("bac-lit-geography.pdf"),withCredentials:false,disableAutoFetch:true,disableStream:true}).promise;}
 if(seq!==renderSeq)return;
 const p=await pdf.getPage(m.page),v=p.getViewport({scale:1.45*zoom}),canvas=el("geoMapCanvas");
 if(seq!==renderSeq)return;
 canvas.width=v.width;canvas.height=v.height;await p.render({canvasContext:canvas.getContext("2d"),viewport:v}).promise;
 if(seq!==renderSeq)return;
 el("geoMapStatus").textContent="الصفحة "+m.page+" من الكتاب الأصلي. كبّر الصورة للتعرف على الرموز والمواقع.";
}catch(e){if(seq!==renderSeq)return;console.warn("تعذر عرض صفحة الكتاب الأصلية",e);await fallbackMap();if(seq!==renderSeq)return;el("geoMapStatus").innerHTML='تعذّر تحميل صورة الصفحة الأصلية؛ تظهر خريطة تعليمية مبسطة بدلاً منها. <a target="_blank" rel="noopener" href="'+bookLink("bac-lit-geography.pdf")+'">افتح الكتاب الأصلي</a> وانتقل إلى الصفحة '+m.page;}
}
function renderTask(){const m=maps[current],q=m.tasks[task];el("geoMapTask").textContent="السؤال "+(task+1)+" من "+m.tasks.length+": "+q[0];el("geoMapAnswer").textContent=q[1];el("geoMapAnswer").classList.add("hidden");}
window.openGeographyMaps=function(){if(state.subject!=="الجغرافيا"){alert("هذا القسم متاح حالياً لمادة الجغرافيا فقط.");return;}show("geoMaps");if(!loaded){loaded=true;draw();}};
window.geoMapMove=function(n){current=(current+n+maps.length)%maps.length;zoom=1;draw();};
window.geoMapZoom=function(n){zoom=Math.max(0.75,Math.min(2.5,zoom+n));draw();};
window.geoMapPrint=function(){const m=maps[current];const w=window.open("","_blank");if(!w){alert("يرجى السماح بالنوافذ المنبثقة للطباعة.");return;}const escapeHTML=t=>String(t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));w.document.write('<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><title>تدريب الخرائط</title><style>body{font-family:Arial;padding:30px}li{margin:18px 0}h1{color:#0f766e}</style><h1>'+escapeHTML(m.title)+'</h1><p>'+escapeHTML(m.source)+'</p><p>ضع المواقع المطلوبة على خريطة صماء أو ارسم مخططاً مبسطاً، ثم راجع إجاباتك من التطبيق.</p><ol>'+m.tasks.map(t=>'<li>'+escapeHTML(t[0])+'</li>').join("")+'</ol></html>');w.document.close();w.print();};
window.geoMapReveal=function(){el("geoMapAnswer").classList.remove("hidden");};
window.geoMapNextTask=function(){task=(task+1)%maps[current].tasks.length;renderTask();};
})();