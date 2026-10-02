/* تنزيل تطبيق أبو شريك مباشرة من الموقع */
(function(){
'use strict';
function build(){
 const home=document.getElementById('abuLandingView');
 if(!home||document.getElementById('abuDownloadSection'))return;
 const section=document.createElement('section');section.id='abuDownloadSection';
 section.style.cssText='max-width:980px;margin:20px auto 70px;padding:0 20px;text-align:center;direction:rtl';
 section.innerHTML=`<div style="background:#fff;border:1px solid #dce8e5;border-radius:24px;padding:28px 20px;box-shadow:0 12px 35px rgba(15,118,110,.08)"><div style="font-size:42px;margin-bottom:8px">📱</div><h2 style="margin:0 0 8px">حمّل تطبيق أبو شريك</h2><p style="margin:0 auto 18px;color:#64748b;line-height:1.8;max-width:620px">نزّل التطبيق مباشرة من موقع أبو شريك. قريباً سيكون متوفراً أيضاً على App Store وGoogle Play.</p><button id="abuDownloadOpen" type="button" style="border:0;border-radius:14px;padding:13px 28px;background:#0f766e;color:#fff;font:inherit;font-weight:800;cursor:pointer">تحميل التطبيق</button></div>`;
 home.appendChild(section);
 const modal=document.createElement('div');modal.id='abuDownloadModal';modal.hidden=true;
 modal.style.cssText='position:fixed;inset:0;z-index:10050;background:rgba(15,23,42,.48);padding:20px;align-items:center;justify-content:center;direction:rtl';
 modal.innerHTML=`<div style="width:min(440px,100%);background:#fff;border-radius:22px;padding:24px;box-shadow:0 24px 70px rgba(0,0,0,.25);text-align:right"><div style="display:flex;align-items:center;justify-content:space-between;gap:12px"><h2 style="margin:0">تحميل أبو شريك</h2><button id="abuDownloadClose" type="button" aria-label="إغلاق" style="border:0;background:#eef5f4;border-radius:10px;width:38px;height:38px;font-size:22px;cursor:pointer">×</button></div><p style="color:#64748b;line-height:1.8">اختر نوع جهازك. سيتم توفير ملف التثبيت هنا مباشرة من موقع أبو شريك.</p><div style="display:grid;gap:12px;margin-top:18px"><button type="button" data-app="ios" style="border:1px solid #dce8e5;background:#f8fbfa;border-radius:15px;padding:15px;font:inherit;font-weight:800;cursor:pointer;text-align:right"> iPhone <small style="display:block;color:#64748b;margin-top:4px;font-weight:500">نسخة iOS — سنضيف ملف التثبيت عند تجهيز النسخة</small></button><button type="button" data-app="android" style="border:1px solid #dce8e5;background:#f8fbfa;border-radius:15px;padding:15px;font:inherit;font-weight:800;cursor:pointer;text-align:right">🤖 Android <small style="display:block;color:#64748b;margin-top:4px;font-weight:500">نسخة Android — سنضيف ملف APK عند تجهيز النسخة</small></button></div><p id="abuDownloadStatus" style="display:none;margin:16px 0 0;padding:11px;border-radius:12px;background:#fff8e7;color:#6b4f00;line-height:1.7"></p></div>`;
 document.body.appendChild(modal);
 const open=()=>{modal.hidden=false;modal.style.display='flex'};
 const close=()=>{modal.hidden=true;modal.style.display='none'};
 section.querySelector('#abuDownloadOpen').onclick=open;modal.querySelector('#abuDownloadClose').onclick=close;modal.onclick=e=>{if(e.target===modal)close()};
 modal.querySelectorAll('[data-app]').forEach(b=>b.onclick=()=>{const s=modal.querySelector('#abuDownloadStatus');s.style.display='block';s.textContent=b.dataset.app==='android'?'ملف Android (APK) قيد التجهيز. عند إضافته سيبدأ التنزيل مباشرة من هذا الموقع.':'نسخة iPhone قيد التجهيز. تثبيت تطبيقات iPhone مباشرة من موقع ويب يحتاج طريقة توزيع iOS مناسبة؛ سنربطها هنا عند تجهيزها.'});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(build,100));else setTimeout(build,100);
})();