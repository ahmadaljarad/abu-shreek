/* خرائط الجغرافيا: صفحات الكتاب الأصلية وتدريبات مستندة إلى الكتاب */
(()=>{
const maps=[
{title:"خريطة التوزع الجغرافي للصناعات في سورية",page:198,why:"تُظهر توزع الصناعات المختلفة بين المدن السورية، مع مفتاح الرموز الصناعي.",source:"الخريطة (3): التوزع الجغرافي للصناعات في سورية، صفحة 198 من كتاب الجغرافيا.",tasks:[["حدّد مدينة حلب على خريطة التوزع الصناعي.","تقع في شمال غربي سورية، وتظهر بجوارها عدة رموز للصناعات."],["حدّد مدينة حمص على الخريطة.","تقع وسط غربي سورية، جنوب حماة."],["أين تظهر مدينة دير الزور الصناعية؟","في شرقي سورية على امتداد نهر الفرات."],["اذكر مدينة صناعية ظاهرة في جنوب سورية.","دمشق أو درعا."],["ما نوع الصناعة الذي يرمز له شكل قطرة الماء في مفتاح الخريطة؟","صناعة تعبئة المياه."],["ما الذي يوضحه مفتاح الخريطة؟","أنواع الصناعات المختلفة الممثلة بالرموز وتوزعها المكاني."]]},
{title:"خريطة المواقع السياحية والأثرية في سورية",page:203,why:"تساعد على فهم توزع المعالم السياحية والمدن والطرق والمطارات في سورية.",source:"خريطة الكتاب ص 203، وتدريب تحديد المواقع ص 207.",tasks:[["حدّد مدينة حلب على الخريطة.","في شمال سورية. راقب موضع قلعة حلب في الصورة."],["حدّد مدينة اللاذقية على الخريطة.","على الساحل السوري غرب البلاد."],["حدّد مدينة إدلب على الخريطة.","تقع جنوب غربي حلب."],["حدّد مدينة دمشق على الخريطة.","في جنوب غربي سورية."],["حدّد مدينة دير الزور على الخريطة.","في شرقي سورية على نهر الفرات."],["حدّد موضع تدمر الأثري.","في البادية السورية وسط البلاد."],["حدّد مدينة دمشق.","في جنوب غربي سورية."],["حدّد مدينة دير الزور.","شرق سورية على نهر الفرات."],["حدّد مدينة طرطوس.","على الساحل السوري جنوب اللاذقية."]]},
{title:"خريطة أهم طرق المواصلات والسكك الحديدية في سورية",page:209,why:"تُظهر توزع الطرق وتركزها في الغرب وصلات المحافظات والمناطق الاقتصادية.",source:"خريطة النقل ص 209، وأسئلة الدرس ص 218.",tasks:[["أين تتركز شبكة الطرق البرية؟","في غربي سورية أكثر من المناطق الشرقية."],["حدّد المحور الذي يصل دمشق بحلب.","يمتد عبر حمص وحماة إلى حلب."],["حدّد طريق دمشق–تدمر–دير الزور.","ينطلق من دمشق شرقاً إلى تدمر ثم دير الزور."],["حدّد الطريق الساحلي.","يمتد بين اللاذقية وطرطوس."],["ما الذي يدل عليه ازدحام الطرق في غربي سورية؟","ارتفاع تركز السكان والمراكز الاقتصادية والعمرانية."],["ما الطريق الواصل بين دمشق وتدمر؟","يمتد من دمشق باتجاه الشرق إلى مدينة تدمر في البادية."]]},
{title:"خريطة الخط الحديدي الحجازي",page:211,why:"توضح مسار الخط الحديدي الحجازي والمدن والمحطات المرتبطة به كما يظهر في الكتاب.",source:"الخريطة (6) للخط الحديدي الحجازي، ص 211 من الكتاب.",tasks:[["ما المدينة التي يبدأ منها الخط الحديدي الحجازي على الخريطة؟","دمشق."],["اذكر مدينة يمر بها الخط بعد دمشق باتجاه الجنوب.","درعا."],["ما الاتجاه العام للخط الحديدي الحجازي من دمشق؟","باتجاه الجنوب نحو الحجاز."],["اذكر محطة أو مدينة من محطات الخط الحديدي الحجازي الظاهرة على الخريطة.","معان أو المدينة المنورة."]]}
];
let current=0,task=0,loaded=false,zoom=1;
const practiceResults={};
let renderSeq=0;
const cropBounds={198:[0.128,0.335,0.875,0.797],203:[0.102,0.238,0.897,0.790],209:[0.143,0.212,0.882,0.621],211:[0.099,0.084,0.568,0.432]};
function originalPageUrl(page){return bookLink("bac-lit-geography.pdf")+"#page="+page;}
function ensureOriginalLink(){let b=el("geoOriginalPageLink");if(!b){b=document.createElement("a");b.id="geoOriginalPageLink";b.className="btn soft";b.target="_blank";b.rel="noopener noreferrer";b.style.cssText="display:inline-block;margin:12px 0";b.textContent="📖 فتح صفحة الخريطة في الكتاب الأصلي";el("geoMapStatus").after(b);}b.href=originalPageUrl(maps[current].page);}

const el=id=>document.getElementById(id);
async function draw(){
 const seq=++renderSeq,m=maps[current];
 el("geoMapTitle").textContent=m.title;el("geoMapWhy").textContent=m.why;el("geoMapSource").textContent=m.source;
 el("geoMapNumber").textContent=(current+1)+" / "+maps.length;
 el("geoMapAnswer").classList.add("hidden");task=0;renderTask();clearMapPractice();
 const canvas=el("geoMapCanvas");canvas.width=0;canvas.height=0;canvas.style.display="none";
 let img=el("geoOriginalMapImage");
 if(!img){img=document.createElement("img");img.id="geoOriginalMapImage";img.alt="الخريطة الأصلية مع عنوانها ومفتاحها من صفحة "+m.page;img.loading="eager";img.style.cssText="display:block;width:100%;max-width:100%;height:auto;margin:0 auto;border-radius:8px";canvas.after(img);}
 img.style.display="none";
 el("geoMapStatus").textContent="جارٍ تحميل صورة الخريطة الأصلية المحفوظة في الموقع...";el("geoMapStatus").style.cursor="default";el("geoMapStatus").onclick=null;
 const file="assets/geography-maps/map-"+m.page+".png";
 const original="assets/geography-maps/page-"+m.page+".png";
 const sources=[
   {url:new URL("./"+file,document.baseURI).href,crop:false},
   {url:"https://raw.githubusercontent.com/ahmadaljarad/abu-shreek/main/"+file,crop:false},
   {url:new URL("./"+original,document.baseURI).href,crop:true},
   {url:"https://raw.githubusercontent.com/ahmadaljarad/abu-shreek/main/"+original,crop:true}
 ];
 let attempt=0;
 function tryOriginal(){
   if(seq!==renderSeq)return;
   if(attempt>=sources.length){img.style.display="none";el("geoMapStatus").textContent="تعذّر تحميل الخريطة. اضغط هنا لإعادة المحاولة.";el("geoMapStatus").style.cursor="pointer";el("geoMapStatus").onclick=()=>draw();return;}
   const source=sources[attempt++];
   const test=new Image();
   
   test.onload=()=>{
     if(seq!==renderSeq)return;
     let displayUrl=source.url;
     if(source.crop){
       try{
         const [l,t,r,b]=cropBounds[m.page],c=document.createElement("canvas");
         c.width=Math.round(test.naturalWidth*(r-l));c.height=Math.round(test.naturalHeight*(b-t));
         c.getContext("2d").drawImage(test,test.naturalWidth*l,test.naturalHeight*t,c.width,c.height,0,0,c.width,c.height);
         displayUrl=c.toDataURL("image/png");
       }catch(err){img.src=source.url;img.style.display="block";el("geoMapStatus").textContent="تم تحميل صفحة الكتاب الأصلية، ويجري تجهيز صورة الخريطة المقصوصة.";return;}
     }
     img.onload=()=>{if(seq!==renderSeq)return;img.style.display="block";img.style.width="100%";setupMapPractice();clearMapPractice();el("geoMapStatus").textContent="الخريطة الأصلية من الصفحة "+m.page+" مع عنوانها ومفتاحها.";};img.onerror=()=>{img.onload=null;img.onerror=null;tryOriginal();};img.src=displayUrl;
   };
   test.onerror=tryOriginal;
   test.src=source.url;
 }
 tryOriginal();
}
function setupMapPractice(){
 const img=el("geoOriginalMapImage");
 if(!img)return;
 let layer=el("geoMapMarkerLayer");
 if(!layer){
   layer=document.createElement("div");layer.id="geoMapMarkerLayer";
   layer.style.cssText="position:absolute;inset:0;pointer-events:none;";
   const wrap=document.createElement("div");wrap.id="geoMapInteractiveWrap";
   wrap.style.cssText="position:relative;display:table;max-width:none;margin:0 auto;";
   img.parentNode.insertBefore(wrap,img);wrap.appendChild(img);wrap.appendChild(layer);
 }
 const note=el("geoMapPracticeNote");
 if(note)note.textContent="اضغط على الخريطة لتضع علامتك، ثم اضغط «إظهار الحل» وقارن موقعك مع الكتاب. لا يُحتسب تصحيح آلي لأن نقاط الإجابة لم تُراجع بعد.";
 img.style.cursor="crosshair";
 img.onclick=e=>{
   const rect=img.getBoundingClientRect();
   if(!rect.width||!rect.height)return;
   const x=Math.max(0,Math.min(100,(e.clientX-rect.left)/rect.width*100));
   const y=Math.max(0,Math.min(100,(e.clientY-rect.top)/rect.height*100));
   layer.innerHTML="";
   const dot=document.createElement("span");
   dot.style.cssText="position:absolute;width:20px;height:20px;border-radius:50%;background:#e11d48;border:3px solid white;box-shadow:0 0 0 2px #e11d48;transform:translate(-50%,-50%);";
   dot.style.left=x+"%";dot.style.top=y+"%";
   layer.appendChild(dot);
   if(note)note.textContent="تم تحديد الموقع باللون الأحمر. اضغط «إظهار الحل» ثم قيّم إجابتك بنفسك.";
 };
}
function clearMapPractice(){
 const layer=el("geoMapMarkerLayer");if(layer)layer.innerHTML="";
 const note=el("geoMapPracticeNote");if(note)note.textContent="اضغط على الخريطة لتضع علامة على إجابتك، ثم قارنها مع الحل.";
 const controls=el("geoMapSelfAssessment");if(controls)controls.style.display="none";
}
function renderTask(){const m=maps[current],q=m.tasks[task];el("geoMapTask").textContent="السؤال "+(task+1)+" من "+m.tasks.length+": "+q[0];el("geoMapAnswer").textContent=q[1];el("geoMapAnswer").classList.add("hidden");}
window.openGeographyMaps=function(){if(state.subject!=="الجغرافيا"){alert("هذا القسم متاح حالياً لمادة الجغرافيا فقط.");return;}show("geoMaps");if(!loaded){loaded=true;draw();}};
window.geoMapMove=function(n){current=(current+n+maps.length)%maps.length;zoom=1;draw();};
window.geoMapZoom=function(n){zoom=Math.max(0.75,Math.min(2.5,zoom+n));const wrap=el("geoMapInteractiveWrap");if(wrap){wrap.style.width=Math.round(100*zoom)+"%";wrap.style.maxWidth="none";}};
window.geoMapPrint=function(){
 const m=maps[current],w=window.open("","_blank");
 if(!w){alert("يرجى السماح بالنوافذ المنبثقة للطباعة.");return;}
 const escapeHTML=t=>String(t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
 const displayed=el("geoOriginalMapImage");
 const imageUrl=displayed&&displayed.style.display!=="none"?displayed.src:new URL("./assets/geography-maps/map-"+m.page+".png",location.href).href;
 w.document.write('<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>تدريب الخرائط</title><style>body{font-family:Arial,sans-serif;padding:20px}h1{color:#0f766e}img{display:block;width:100%;max-height:65vh;object-fit:contain;margin:12px auto}li{margin:10px 0}@media print{body{padding:0}img{max-height:58vh}}</style></head><body><h1>'+escapeHTML(m.title)+'</h1><p>'+escapeHTML(m.source)+'</p><img id="printMap" src="'+imageUrl+'" alt="صفحة الكتاب الأصلية"><h2>أسئلة التدريب</h2><ol>'+m.tasks.map(t=>'<li>'+escapeHTML(t[0])+'</li>').join("")+'</ol></body></html>');
 w.document.close();
 const printImage=w.document.getElementById("printMap");
 printImage.onload=()=>{w.focus();w.print();};
 printImage.onerror=()=>{w.alert("تعذّر تحميل صورة الكتاب الأصلية للطباعة.");};
 if(printImage.complete&&printImage.naturalWidth){w.focus();w.print();}
};
window.geoMapReveal=function(){el("geoMapAnswer").classList.remove("hidden");const controls=el("geoMapSelfAssessment");if(controls)controls.style.display="flex";};
window.geoMapRate=function(correct){const key=maps[current].page+":"+task;practiceResults[key]=correct;const values=Object.values(practiceResults);const correctCount=values.filter(Boolean).length;const label=el("geoMapPracticeScore");if(label)label.textContent="تقييمك الذاتي: "+correctCount+" إجابة صحيحة من "+values.length+" إجابة قيّمتها.";window.geoMapNextTask();};
window.geoMapClearMarker=function(){clearMapPractice();};
window.geoMapNextTask=function(){task=(task+1)%maps[current].tasks.length;renderTask();clearMapPractice();};
})();