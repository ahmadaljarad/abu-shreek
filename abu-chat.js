(function(){'use strict';
let panel=null;
const conversation=[];
let selectedSubject='';
function close(){if(panel){panel.remove();panel=null}}
function open(){
 document.getElementById('abuMentorModal')?.remove();
 if(panel){panel.remove();panel=null;return}
 panel=document.createElement('section');panel.id='abuChatPanel';panel.dir='rtl';
 panel.style.cssText='position:fixed;z-index:1000003;left:clamp(12px,3vw,32px);bottom:100px;width:min(390px,calc(100vw - 24px));height:min(540px,calc(100dvh - 125px));background:white;color:#18302e;border:1px solid #b9dad5;border-radius:20px;box-shadow:0 14px 40px #0004;display:flex;flex-direction:column;overflow:hidden;font:15px/1.7 Arial,sans-serif';
 const head=document.createElement('div');head.style.cssText='display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:#236f70;color:white';
 const title=document.createElement('strong');title.textContent='أبو شريك — احكي معي';
 const close=document.createElement('button');close.textContent='✕';close.setAttribute('aria-label','إغلاق المحادثة');close.style.cssText='background:transparent;color:white;border:0;font-size:20px;cursor:pointer';close.onclick=()=>{panel.remove();panel=null};head.append(title,close);
 const log=document.createElement('div');log.setAttribute('aria-live','polite');log.style.cssText='flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px';
 const add=(message,mine)=>{const bubble=document.createElement('div');bubble.textContent=message;bubble.style.cssText='max-width:90%;padding:9px 12px;border-radius:14px;white-space:pre-wrap;align-self:'+(mine?'flex-start':'flex-end')+';background:'+(mine?'#e5f4f0':'#f0f2f4');log.append(bubble);log.scrollTop=log.scrollHeight;return bubble};
 add('أهلاً وسهلاً! أنا أبو شريك. اسألني عن دراستك أو أي درس بدك تفهمه. إذا بدك جدولك الدراسي، اضغط زر «خطتي الدراسية» المنفصل.',false);
 const controls=document.createElement('div');controls.style.cssText='display:flex;align-items:center;gap:8px;padding:8px 12px;border-bottom:1px solid #dce8e5';
 const subject=document.createElement('select');subject.setAttribute('aria-label','اختر المادة');subject.style.cssText='flex:1;min-width:0;padding:8px;border:1px solid #dce8e5;border-radius:9px;background:white;font:inherit';
 const options=['كل المواد','العربي','الإنكليزي','الرياضيات','الفيزياء','الكيمياء','الأحياء','التاريخ','الجغرافيا','الفلسفة','العلوم'];
 options.forEach(name=>{const option=document.createElement('option');option.textContent=name;option.value=name==='كل المواد'?'':name;subject.append(option)});
 subject.value=selectedSubject;subject.onchange=()=>{selectedSubject=subject.value};
 const clear=document.createElement('button');clear.type='button';clear.textContent='مسح المحادثة';clear.style.cssText='border:0;background:#edf5f3;border-radius:9px;padding:8px;cursor:pointer;font:inherit';
 clear.onclick=()=>{conversation.length=0;log.replaceChildren();add('بلّشنا محادثة جديدة. شو بدك ندرس اليوم؟',false)};
 controls.append(subject,clear);
 conversation.forEach(turn=>add(turn.text,turn.role==='user'));
 const form=document.createElement('form');form.style.cssText='display:flex;gap:7px;padding:12px;border-top:1px solid #dce8e5';
 const input=document.createElement('input');input.type='text';input.placeholder='شو حابب تسأل أبو شريك؟';input.setAttribute('aria-label','رسالتك لأبو شريك');input.required=true;input.style.cssText='flex:1;min-width:0;padding:10px;border:1px solid #ccd8d5;border-radius:10px;font:inherit';
 const send=document.createElement('button');send.textContent='إرسال';send.type='submit';send.style.cssText='border:0;border-radius:10px;background:#236f70;color:white;padding:8px 12px;cursor:pointer';
 form.append(input,send);
 form.onsubmit=async e=>{e.preventDefault();const q=input.value.trim();if(!q)return;input.value='';add(q,true);const previous=conversation.slice(-6).map(turn=>(turn.role==='user'?'الطالب: ':'أبو شريك: ')+turn.text.slice(0,450)).join('\n');conversation.push({role:'user',text:q});const waiting=add('عم فكّر بسؤالك...',false);send.disabled=true;try{const response=await fetch('https://abu-shreek-api.ahmad-aljarad.workers.dev/api/ask',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:(previous?'سياق المحادثة السابقة:\n'+previous+'\n\n':'')+(selectedSubject?'المادة: '+selectedSubject+'\n':'')+'سؤال الطالب الحالي: '+q,level:window.ABU_MENTOR_CURRENT_USER?.level||'',book:selectedSubject,pageText:''})});if(!response.ok)throw Error('HTTP '+response.status);const result=await response.json();waiting.textContent=result.answer||result.error||'ما وصلت إجابة. حاول مرة ثانية.';if(result.answer){conversation.push({role:'assistant',text:result.answer});if(conversation.length>20)conversation.splice(0,conversation.length-20)}}catch(err){waiting.textContent='تعذر الاتصال بخدمة أبو شريك حالياً. جرّب لاحقاً.'}finally{send.disabled=false;input.focus()}};
 panel.append(head,controls,log,form);document.body.append(panel);input.focus();
}
window.ABU_CHAT={open,close};
})();
