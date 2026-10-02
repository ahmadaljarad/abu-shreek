/* آلة حاسبة علمية - للصف التاسع والبكالوريا العلمي في الرياضيات والفيزياء والكيمياء */
(function(){
  const allowed=()=> (state.level==='تاسع' && ['الرياضيات','الفيزياء والكيمياء'].includes(state.subject)) || (state.level==='بكالوريا علمي' && ['الرياضيات','الفيزياء','الكيمياء'].includes(state.subject));
  let expr='', angle='DEG', memory=0;
  function ensure(){
    if(document.getElementById('scientificCalculator'))return;
    const d=document.createElement('div');d.id='scientificCalculator';d.className='hidden';
    d.style.cssText='position:fixed;inset:0;background:#0006;z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px';
    d.innerHTML=`<div style="width:min(500px,100%);max-height:92vh;overflow:auto;background:white;border:1px solid #dce8e5;border-radius:22px;padding:18px;box-shadow:0 18px 60px #0003" dir="ltr">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px" dir="rtl"><h2 style="margin:0">🧮 الآلة الحاسبة العلمية</h2><button class="btn soft" id="calcClose">إغلاق ×</button></div>
      <p class="note" dir="rtl">للرياضيات والفيزياء والكيمياء — تعمل داخل التطبيق.</p>
      <div id="calcExpr" style="min-height:34px;text-align:left;color:#64748b;overflow-wrap:anywhere;padding:8px 4px"></div>
      <div id="calcDisplay" style="min-height:58px;background:#f4f8f7;border:1px solid #dce8e5;border-radius:14px;padding:12px;font-size:28px;text-align:left;overflow-wrap:anywhere">0</div>
      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-top:12px" id="calcKeys"></div>
    </div>`;
    document.body.appendChild(d);d.querySelector('#calcClose').onclick=closeCalculator;d.addEventListener('click',e=>{if(e.target===d)closeCalculator()});
    const keys=[['DEG','angle'],['MC','mc'],['MR','mr'],['M+','mplus'],['AC','clear'],['sin','sin('],['cos','cos('],['tan','tan('],['π','pi'],['⌫','back'],['sin⁻¹','asin('],['cos⁻¹','acos('],['tan⁻¹','atan('],['e','E'],['÷','/'],['√','sqrt('],['∛','cbrt('],['x²','^2'],['xʸ','^'],['×','*'],['log','log('],['ln','ln('],['(', '('],[')',')'],['10ˣ','10^('],['1/x','1/('],['7','7'],['8','8'],['9','9'],['|x|','abs('],['%','/100'],['4','4'],['5','5'],['6','6'],['EXP','E'],['±','neg'],['1','1'],['2','2'],['3','3'],['−','-'],['+','+'],['0','0'],['.','.'],['=','equals']];
    const box=d.querySelector('#calcKeys');keys.forEach(([label,act])=>{const b=document.createElement('button');b.className='btn '+(act==='equals'?'primary':'soft');b.textContent=label;b.style.cssText='padding:12px 6px;min-width:0';b.dataset.act=act;b.onclick=()=>press(act,b);box.appendChild(b)});
  }
  function update(){const e=document.getElementById('calcExpr'),v=document.getElementById('calcDisplay');if(e)e.textContent=expr||' ';if(v)v.textContent=expr||'0'}
  function autoClose(s){let n=0;for(const c of s){if(c==='(')n++;else if(c===')')n--;}return n>0?s+')'.repeat(n):s}
  function toJS(s){
    let x=s.replace(/π/g,'pi').replace(/\^/g,'**');
    x=x.replace(/asin\(/g,'ASIN(').replace(/acos\(/g,'ACOS(').replace(/atan\(/g,'ATAN(');
    x=x.replace(/sin\(/g,'SIN(').replace(/cos\(/g,'COS(').replace(/tan\(/g,'TAN(');
    x=x.replace(/sqrt\(/g,'SQRT(').replace(/cbrt\(/g,'CBRT(').replace(/log\(/g,'LOG10(').replace(/ln\(/g,'LN(').replace(/abs\(/g,'ABS(');
    x=x.replace(/\bpi\b/g,'PI').replace(/\bE\b/g,'EULER');
    return x;
  }
  function evaluate(raw){
    const js=toJS(autoClose(raw));
    const rad=x=>angle==='DEG'?x*Math.PI/180:x;
    const inv=x=>angle==='DEG'?x*180/Math.PI:x;
    return Function('SIN','COS','TAN','ASIN','ACOS','ATAN','SQRT','CBRT','LOG10','LN','ABS','PI','EULER','"use strict";return ('+js+')')(
      x=>Math.sin(rad(x)),x=>Math.cos(rad(x)),x=>Math.tan(rad(x)),x=>inv(Math.asin(x)),x=>inv(Math.acos(x)),x=>inv(Math.atan(x)),Math.sqrt,Math.cbrt,Math.log10,Math.log,Math.abs,Math.PI,Math.E
    );
  }
  function result(){try{if(!expr)return;const val=evaluate(expr);if(!Number.isFinite(val))throw 0;expr=String(Math.abs(val)<1e-14?0:Number(val.toPrecision(12)));update()}catch{document.getElementById('calcDisplay').textContent='خطأ في العملية'}}
  function press(a,b){
    if(a==='clear'){expr='';update();return} if(a==='back'){expr=expr.slice(0,-1);update();return} if(a==='equals'){result();return}
    if(a==='angle'){angle=angle==='DEG'?'RAD':'DEG';b.textContent=angle;return} if(a==='neg'){expr=expr?`-(${expr})`:'-';update();return}
    if(a==='mc'){memory=0;return} if(a==='mr'){expr+=String(memory);update();return} if(a==='mplus'){try{memory+=Number(evaluate(expr))||0}catch{}return}
    expr+=a;update();
  }
  window.openCalculator=function(){if(!allowed())return;ensure();document.getElementById('scientificCalculator').classList.remove('hidden');update()};
  window.closeCalculator=function(){const d=document.getElementById('scientificCalculator');if(d)d.classList.add('hidden')};
  window.refreshCalculatorButton=function(){
    let b=document.getElementById('calcOpenButton');
    if(!allowed()){if(b)b.remove();return}
    if(b)return;
    const top=document.querySelector('#module .topbar');if(!top)return;b=document.createElement('button');b.id='calcOpenButton';b.className='btn primary';b.innerHTML='🧮 آلة حاسبة علمية';b.onclick=openCalculator;top.appendChild(b);
  };
  const old=window.openSubject;window.openSubject=function(s){old(s);setTimeout(refreshCalculatorButton,0)};
})();