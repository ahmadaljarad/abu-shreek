/* تدريب خرائط سورية التفاعلي - إضافة مستقلة لا تغيّر الخرائط السابقة */
(()=>{
const sites=[
["دمشق",36.291,33.513],["حلب",37.161,36.202],["تدمر",38.284,34.560],["ميناء اللاذقية",35.776,35.523],["ميناء طرطوس",35.886,34.895],["دير الزور",40.141,35.335],["حمص",36.716,34.731],["حماة",36.751,35.132]];
const rivers=[["نهر الفرات",[[38.7,36.8],[39.2,36.4],[39.7,36.1],[40.1,35.4],[40.6,34.8],[40.95,34.45]]],["نهر العاصي",[[36.2,34.3],[36.5,34.7],[36.7,35.1],[36.3,35.7],[36.1,36.1]]]];
const svgNS="http://www.w3.org/2000/svg",W=520,H=520,extent=[35.55,32.25,42.4,37.35];
const xy=(lon,lat)=>[(lon-extent[0])/(extent[2]-extent[0])*W,(extent[3]-lat)/(extent[3]-extent[1])*H];
let current=0,mode="tap",answer=null,features=null,showSolution=false;
const E=(tag,attrs={})=>{const e=document.createElementNS(svgNS,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,v);return e;};
const host=document.createElement("div");host.id="syriaMapTrainer";host.style.cssText="margin-top:30px;padding:18px;border:1px solid #cbded9;border-radius:18px;background:#f8fffd";
host.innerHTML='<h2>📍 خريطة سورية الصماء التفاعلية</h2><p class="note">تدريب إضافي مقترح، وليس سؤالاً رسمياً من امتحان سابق. المواقع تقريبية لأغراض التدريب.</p><div class="actions"><button class="btn primary" id="geoTapMode">تحديد الموقع بالنقر</button><button class="btn soft" id="geoNameMode">كتابة اسم الموقع</button><button class="btn soft" id="geoRetry">إعادة المحاولة</button></div><p id="geoInteractiveQuestion" style="font-weight:bold" aria-live="polite"></p><div id="geoInteractiveMap" style="max-width:520px;margin:auto"></div><div id="geoInteractiveInput" class="hidden"><label for="geoSiteName">اكتب اسم الموقع المرقّم على الخريطة</label><input id="geoSiteName" autocomplete="off" placeholder="اسم المدينة أو الموقع"><button class="btn primary" id="geoCheckName">تحقق من الإجابة</button></div><p id="geoInteractiveFeedback" aria-live="polite"></p><div class="actions"><button class="btn soft" id="geoShowSolution">إظهار التصحيح</button><button class="btn primary" id="geoNextSite">السؤال التالي</button></div><p class="note">مصدر حدود سورية: بيانات Natural Earth العامة عبر مستودع datasets/geo-countries. المواقع الجغرافية تقريبية. لا تُنسب هذه الخريطة إلى الكتاب المدرسي.</p>';
function normalize(s){return s.trim().replace(/[أإآ]/g,"ا").replace(/ة/g,"ه").replace(/[ًٌٍَُِّْـ]/g,"").replace(/\s+/g," ");}
function pathOf(rings){return rings.map(r=>r.map((c,i)=>{const p=xy(c[0],c[1]);return (i?"L":"M")+p.map(n=>n.toFixed(1)).join(" ")}).join(" ")+"Z").join(" ");}
function render(){
 const box=document.getElementById("geoInteractiveMap");box.replaceChildren();
 const svg=E("svg",{viewBox:"0 0 520 520",role:"img","aria-label":"خريطة سورية الصماء للتدريب",style:"width:100%;height:auto;touch-action:manipulation;background:#eaf6fa;border-radius:12px"});
 if(features){const coords=features.geometry.coordinates;const rings=features.geometry.type==="MultiPolygon"?coords.flat():coords;svg.appendChild(E("path",{d:pathOf(rings),fill:"#f9f4df",stroke:"#17675c","stroke-width":"2.5","fill-rule":"evenodd"}));}
 else{const t=E("text",{x:260,y:240,"text-anchor":"middle",fill:"#334155"});t.textContent="تعذّر تحميل حدود سورية. تحقق من اتصال الإنترنت.";svg.appendChild(t);}
 if(features){
  rivers.forEach(([name,pts])=>{const d=pts.map((p,i)=>{const q=xy(...p);return(i?"L":"M")+q.join(" ")}).join(" ");svg.appendChild(E("path",{d,stroke:"#6db9d3","stroke-width":3,fill:"none","stroke-dasharray":"6 5",opacity:".8"}));});
  const selected=sites[current],p=xy(selected[1],selected[2]);
  if(mode==="name"||showSolution){svg.appendChild(E("circle",{cx:p[0],cy:p[1],r:9,fill:showSolution?"#0f766e":"#c2410c",stroke:"white","stroke-width":3}));const label=E("text",{x:p[0]+12,y:p[1]-12,fill:"#102a2e","font-size":17,"font-weight":"bold"});label.textContent=showSolution?selected[0]:"؟";svg.appendChild(label);}
  if(answer){const a=xy(...answer);svg.appendChild(E("circle",{cx:a[0],cy:a[1],r:7,fill:"#d97706",stroke:"white","stroke-width":2}));}
  svg.addEventListener("click",ev=>{if(mode!=="tap"||showSolution)return;const r=svg.getBoundingClientRect(),x=(ev.clientX-r.left)/r.width*W,y=(ev.clientY-r.top)/r.height*H;answer=[extent[0]+x/W*(extent[2]-extent[0]),extent[3]-y/H*(extent[3]-extent[1])];const distance=Math.hypot((x-p[0]),(y-p[1]));document.getElementById("geoInteractiveFeedback").textContent=distance<=24?"✓ إجابة صحيحة!":"الموقع غير دقيق. حاول مرة أخرى أو اعرض التصحيح.";render();});
 }
 box.appendChild(svg);
 document.getElementById("geoInteractiveQuestion").textContent=mode==="tap"?"حدّد على الخريطة: "+sites[current][0]:"ما اسم الموقع المميز بعلامة الاستفهام؟";
 document.getElementById("geoInteractiveInput").classList.toggle("hidden",mode!=="name");
}
function reset(){answer=null;showSolution=false;document.getElementById("geoSiteName").value="";document.getElementById("geoInteractiveFeedback").textContent="";render();}
async function load(){try{const res=await fetch("https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson");if(!res.ok)throw Error("geojson");const data=await res.json();features=data.features.find(f=>["Syria","Syrian Arab Republic"].includes(f.properties.ADMIN)||f.properties.ISO_A3==="SYR");}catch(e){console.warn("تعذر تحميل حدود سورية",e);}render();}
function init(){const target=document.querySelector("#geoMaps .study");if(!target||document.getElementById("syriaMapTrainer"))return;target.appendChild(host);document.getElementById("geoTapMode").onclick=()=>{mode="tap";reset()};document.getElementById("geoNameMode").onclick=()=>{mode="name";reset()};document.getElementById("geoRetry").onclick=reset;document.getElementById("geoNextSite").onclick=()=>{current=(current+1)%sites.length;reset()};document.getElementById("geoShowSolution").onclick=()=>{showSolution=true;document.getElementById("geoInteractiveFeedback").textContent="الإجابة: "+sites[current][0];render()};document.getElementById("geoCheckName").onclick=()=>{const ok=normalize(document.getElementById("geoSiteName").value)===normalize(sites[current][0]);document.getElementById("geoInteractiveFeedback").textContent=ok?"✓ إجابة صحيحة!":"الإجابة غير صحيحة، حاول مجدداً.";};load();}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();