/* Abu Shreek secure school selection: profiles and roles always come from Supabase RLS. */
(function(){
'use strict';
const levels=['تاسع','بكالوريا علمي','بكالوريا أدبي'];
const config=window.ABU_AUTH_CONFIG;
if(!config?.url||!config?.anonKey||!window.supabase){console.error('Supabase authentication configuration missing');return;}
const client=window.supabase.createClient(config.url,config.anonKey);
let current=null, profile=null, recovering=false;
const style=document.createElement('style');style.textContent='#abuGate{position:fixed;inset:0;z-index:999999;background:#f4f8f7;display:flex;justify-content:center;align-items:center;padding:18px;direction:rtl}#abuGate .panel{background:#fff;border:1px solid #dce8e5;border-radius:20px;padding:24px;width:min(440px,100%);max-height:92vh;overflow:auto;box-shadow:0 12px 40px #0002}#abuGate input,#abuGate select{width:100%;padding:12px;margin:7px 0;border:1px solid #cbd5e1;border-radius:10px;font:inherit}#abuGate button{padding:12px;border:0;border-radius:10px;background:#0f766e;color:white;cursor:pointer;margin:5px}#abuGate p{line-height:1.8}#abuAdmin{position:fixed;inset:0;z-index:999998;background:#0009;display:flex;justify-content:center;align-items:center;padding:16px;direction:rtl}#abuAdmin .panel{background:white;border-radius:16px;padding:22px;width:min(680px,100%);max-height:85vh;overflow:auto}#abuAdmin select{padding:7px;margin:4px}#abuAdmin button{padding:8px;margin:4px}';document.head.appendChild(style);
const gate=document.createElement('div');gate.id='abuGate';gate.innerHTML='<div class="panel"><h2>🎓 أبو شريك</h2><p id="abuStatus">جارٍ التحقق من حسابك...</p><div id="abuAuthContent"></div></div>';document.body.appendChild(gate);
const status=t=>document.getElementById('abuStatus').textContent=t;
function form(signup){
 const body=document.getElementById('abuAuthContent');body.replaceChildren();
 const form=document.createElement('form');form.innerHTML='<input type="email" required placeholder="البريد الإلكتروني" autocomplete="email"><input type="password" minlength="8" required placeholder="كلمة المرور" autocomplete="'+(signup?'new-password':'current-password')+'">';
 if(signup){const name=document.createElement('input');name.placeholder='اسم الطالب';name.required=true;name.maxLength=100;const select=document.createElement('select');for(const l of levels){const o=document.createElement('option');o.value=l;o.textContent=l;select.appendChild(o)}form.append(name,select)}
 const submit=document.createElement('button');submit.type='submit';submit.textContent=signup?'إنشاء حساب':'دخول';form.append(submit);
 form.onsubmit=async e=>{e.preventDefault();submit.disabled=true;try{const email=form.children[0].value.trim(),password=form.children[1].value;const result=signup?await client.auth.signUp({email,password,options:{data:{display_name:form.children[2].value.trim(),school_level:form.children[3].value}}}):await client.auth.signInWithPassword({email,password});if(result.error)throw result.error;if(signup&&!result.data.session)status('تم إنشاء الحساب. تحقق من رسالة تأكيد البريد الإلكتروني.');else await refresh()}catch(err){status('تعذر إتمام العملية: '+err.message)}finally{submit.disabled=false}};
 if(!signup){const forgot=document.createElement('button');forgot.type='button';forgot.textContent='نسيت كلمة المرور؟';forgot.style.background='#e7f5f2';forgot.style.color='#0f766e';forgot.onclick=resetRequestView;body.append(form,forgot);}
 const switcher=document.createElement('button');switcher.type='button';switcher.textContent=signup?'لدي حساب بالفعل':'إنشاء حساب جديد';switcher.onclick=()=>{status('اختر مرحلتك عند إنشاء الحساب، ولا يمكن تغييرها إلا بواسطة المدير.');formView(!signup)};if(signup)body.append(form);body.append(switcher);
}
function resetRequestView(){
 status('أدخل بريدك الإلكتروني وسنرسل رابطاً لتعيين كلمة مرور جديدة.');
 const body=document.getElementById('abuAuthContent');body.replaceChildren();
 const f=document.createElement('form');const email=document.createElement('input');email.type='email';email.required=true;email.placeholder='البريد الإلكتروني';email.autocomplete='email';const send=document.createElement('button');send.type='submit';send.textContent='إرسال رابط الاستعادة';f.append(email,send);
 f.onsubmit=async e=>{e.preventDefault();send.disabled=true;try{const {error}=await client.auth.resetPasswordForEmail(email.value.trim(),{redirectTo:location.origin+location.pathname});if(error)throw error;status('إذا كان البريد مسجلاً، ستصلك رسالة لاستعادة كلمة المرور. تفقد البريد غير المرغوب أيضاً.')}catch(err){status('تعذر إرسال الرابط: '+err.message)}finally{send.disabled=false}};
 const back=document.createElement('button');back.textContent='العودة لتسجيل الدخول';back.onclick=()=>formView(false);body.append(f,back);
}
function newPasswordView(){
 gate.style.display='flex';status('اختر كلمة مرور جديدة لحسابك.');const body=document.getElementById('abuAuthContent');body.replaceChildren();
 const f=document.createElement('form');const password=document.createElement('input');password.type='password';password.required=true;password.minLength=8;password.placeholder='كلمة المرور الجديدة (8 أحرف على الأقل)';password.autocomplete='new-password';const confirm=document.createElement('input');confirm.type='password';confirm.required=true;confirm.minLength=8;confirm.placeholder='تأكيد كلمة المرور الجديدة';confirm.autocomplete='new-password';const save=document.createElement('button');save.type='submit';save.textContent='حفظ كلمة المرور';f.append(password,confirm,save);body.append(f);
 f.onsubmit=async e=>{e.preventDefault();if(password.value!==confirm.value){status('كلمتا المرور غير متطابقتين.');return}save.disabled=true;try{const {error}=await client.auth.updateUser({password:password.value});if(error)throw error;status('تم تحديث كلمة المرور بنجاح.');recovering=false;history.replaceState(null,'',location.pathname);await refresh()}catch(err){status('تعذر تحديث كلمة المرور: '+err.message)}finally{save.disabled=false}};
}

function formView(signup){status('المرحلة الدراسية ثابتة بعد التسجيل ولا يغيّرها إلا المدير.');form(signup)}
function onlyLevel(level){document.querySelectorAll('#home .card').forEach(card=>{const action=card.getAttribute('onclick')||'';card.hidden=!action.includes("'"+level+"'");card.style.display=card.hidden?'none':''})}
function guardNavigation(){
 if(window.__abuNavigationGuard)return;window.__abuNavigationGuard=true;
 const original=window.openLevel;
 window.openLevel=function(level){if(!profile)return; if(profile.role!=='admin'&&level!==profile.school_level){alert('هذه المرحلة غير متاحة لحسابك.');return;}return original?.apply(this,arguments)};
}
async function refresh(){
 if(recovering){newPasswordView();return}
 const {data:{user},error}=await client.auth.getUser();
 if(error||!user){current=null;profile=null;gate.style.display='flex';formView(false);return}
 current=user;
 const {data,error:pe}=await client.from('student_profiles').select('user_id,display_name,school_level,role').eq('user_id',user.id).single();
 if(pe||!data){profile=null;gate.style.display='flex';status('حسابك موجود، لكن ملف الطالب غير جاهز. يجب تشغيل إعداد قاعدة البيانات في Supabase أولاً.');document.getElementById('abuAuthContent').replaceChildren();const logout=document.createElement('button');logout.textContent='تسجيل الخروج';logout.onclick=()=>client.auth.signOut().then(refresh);document.getElementById('abuAuthContent').append(logout);return}
 profile=data;gate.style.display='none';guardNavigation();onlyLevel(profile.school_level);
 let menu=document.getElementById('abuAccount');if(!menu){menu=document.createElement('button');menu.id='abuAccount';menu.className='btn primary';menu.style.cssText='position:fixed;bottom:16px;left:16px;z-index:9000';document.body.append(menu)}
 menu.textContent=profile.role==='admin'?'⚙️ المدير':'👤 '+(profile.display_name||profile.school_level);
 menu.onclick=()=>profile.role==='admin'?adminPanel():accountPanel();
}
function accountPanel(){const action=confirm('المرحلة: '+profile.school_level+'\nهل تريد تسجيل الخروج؟');if(action)client.auth.signOut().then(()=>{document.getElementById('abuAccount')?.remove();refresh()})}
async function adminPanel(){
 const modal=document.createElement('div');modal.id='abuAdmin';const panel=document.createElement('div');panel.className='panel';modal.append(panel);
 const heading=document.createElement('h2');heading.textContent='إدارة مراحل الطلاب';panel.append(heading);
 const close=document.createElement('button');close.textContent='إغلاق';close.onclick=()=>modal.remove();panel.append(close);
 const {data,error}=await client.from('student_profiles').select('user_id,display_name,school_level,role').order('created_at',{ascending:false});
 if(error){const p=document.createElement('p');p.textContent=error.message;panel.append(p);document.body.append(modal);return}
 for(const student of data||[]){const row=document.createElement('div');row.style.cssText='padding:10px;border-bottom:1px solid #ddd';const name=document.createElement('span');name.textContent=(student.display_name||student.user_id)+' — ';row.append(name);
 const select=document.createElement('select');for(const l of levels){const option=document.createElement('option');option.value=l;option.textContent=l;option.selected=l===student.school_level;select.append(option)}row.append(select);
 const save=document.createElement('button');save.textContent='تغيير المرحلة';save.onclick=async()=>{save.disabled=true;const {error}=await client.rpc('admin_change_school_level',{target_user:student.user_id,next_level:select.value});alert(error?error.message:'تم تحديث المرحلة');save.disabled=false};row.append(save);panel.append(row)}
 const logout=document.createElement('button');logout.textContent='تسجيل الخروج';logout.onclick=()=>client.auth.signOut().then(()=>location.reload());panel.append(logout);document.body.append(modal);
}
client.auth.onAuthStateChange((event)=>{if(event==='PASSWORD_RECOVERY'){recovering=true;newPasswordView();return}if(!recovering)setTimeout(refresh,0)});refresh();
})();
