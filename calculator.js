/* آلة حاسبة علمية - للصف التاسع والبكالوريا العلمي في الرياضيات والفيزياء والكيمياء */
(function(){
  const allowed=()=> (state.level==='تاسع' && ['الرياضيات','الفيزياء والكيمياء'].includes(state.subject)) || (state.level==='بكالوريا علمي' && ['الرياضيات','الفيزياء','الكيمياء'].includes(state.subject));
  let expr='', angle='DEG', memory=0;
  const esc=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  function ensure(){
    if(document.getElementById('scientificCalculator'))return;
    const d=document.createElement('div');d.id='scientificCalculator';d.className='hidden';
    d.style.cssText='position:fixed;inset:0;background:#0006;z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px';
    d.innerHTML=`<div style="width:min(460px,100%);max-height:92vh;overflow:auto;background:white;border:1px solid #dce8e5;border-radius:22px;padding:18px;box-shadow:0 18px 60px #0003" dir="ltr">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px" dir="rtl"><h2 style="margin:0">🧮 الآلة الحاسبة العلمية</h2><button class="btn soft" id="calcClose">إغلاق ×</button></div>
      <p class="note" dir="rtl">للرياضيات والفيزياء والكيمياء — تعمل داخل التطبيق.</p>
      <div id="calcExpr" style="min-height:34px;text-align:left;color:#64748b;overflow-wrap:anywhere;padding:8px 4px"></div>
      <div id="calcDisplay" style="min-height:58px;background:#f4f8f7;border:1px solid #dce8e5;border-radius:14px;padding:12px;font-size:28px;text-align:left;overflow-wrap:anywhere">0</div>
      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-top:12px" id="calcKeys"></div>
    </div>`;
    document.body.appendChild(d);d.querySelector('#calcClose').onclick=closeCalculator;d.addEventListener('click',e=>{if(e.target===d)closeCalculator()});
    const keys=[['DEG','angle'],['MC','mc'],['MR','mr'],['M+','mplus'],['AC','clear'],['sin','sin('],['cos','cos('],['tan','tan('],['π','pi'],['⌫','back'],['sin⁻¹','asin('],['cos⁻¹','acos('],['tan⁻¹','atan('],['e','E'],['÷','/'],['√','sqrt('],['x²','^2'],['xʸ','^'],['(','('],['×','*'],['log','log('],['ln','ln('],['7','7'],['8','8'],['9','9'],['10ˣ','10^('],['1/x','1/('],['4','4'],['5','5'],['6','6'],['|x|','abs('],['%','/100'],['1','1'],['2','2'],['3','3'],['EXP','E'],['±','neg'],['0','0'],['.','.'],['+','+'],['−','-'],['=','equals']];
    const box=d.querySelector('#calcKeys');keys.forEach(([label,act])=>{const b=document.createElement('button');b.className='btn '+(act==='equals'?'primary':'soft');b.textContent=label;b.style.cssText='padding:12px 6px;min-width:0';b.dataset.act=act;b.onclick=()=>press(act,b);box.appendChild(b)});
  }
  function update(){const e=document.getElementById('calcExpr'),v=document.getElementById('calcDisplay');if(e)e.textContent=expr||' ';if(v)v.textContent=expr||'0'}
  function toJS(s){
    let x=s.replace(/π/g,'pi').replace(/\^/g,'**');
    const a=angle==='DEG'?'(Math.PI/180)':'1', inv=angle==='DEG'?'(180/Math.PI)':'1';
    x=x.replace(/asin\(/g,`(Math.asin(`).replace(/acos\(/g,`(Math.acos(`).replace(/atan\(/g,`(Math.atan(`);
    if(angle==='DEG')x=x.replace(/Math\.asin\(([^()]*)\)/g,`(Math.asin($1)*${inv})`).replace(/Math\.acos\(([^()]*)\)/g,`(Math.acos($1)*${inv})`).replace(/Math\.atan\(([^()]*)\)/g,`(Math.atan($1)*${inv})`);
    x=x.replace(/sin\(/g,`Math.sin(${a}*`).replace(/cos\(/g,`Math.cos(${a}*`).replace(/tan\(/g,`Math.tan(${a}*`).replace(/sqrt\(/g,'Math.sqrt(').replace(/log\(/g,'Math.log10(').replace(/ln\(/g,'Math.log(').replace(/abs\(/g,'Math.abs(').replace(/\bpi\b/g,'Math.PI').replace(/\bE\b/g,'Math.E');
    return x;
  }
  function result(){try{if(!expr)return;const val=Function('"use strict";return ('+toJS(expr)+')')();if(!Number.isFinite(val))throw 0;expr=String(Math.abs(val)<1e-14?0:Number(val.toPrecision(12)));update()}catch{document.getElementById('calcDisplay').textContent='خطأ في العملية'}}
  function press(a,b){
    if(a==='clear'){expr='';update();return} if(a==='back'){expr=expr.slice(0,-1);update();return} if(a==='equals'){result();return}
    if(a==='angle'){angle=angle==='DEG'?'RAD':'DEG';b.textContent=angle;return} if(a==='neg'){expr=expr?`-(${expr})`:'-';update();return}
    if(a==='mc'){memory=0;return} if(a==='mr'){expr+=String(memory);update();return} if(a==='mplus'){try{memory+=Number(Function('return ('+toJS(expr)+')')())||0}catch{}return}
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