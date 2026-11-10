/* Pop-up promos: only frontend. Tidak mengubah pesanan, D1, maupun pembayaran. */
(()=>{
 'use strict';
 const overlay=document.getElementById('verly-promo');
 if(!overlay) return;
 const first=document.getElementById('verly-promo-slide-one');
 const second=document.getElementById('verly-promo-slide-two');
 const count=document.getElementById('verly-promo-count');
 const next=document.getElementById('verly-promo-next');
 const arrow=document.getElementById('verly-promo-next-arrow');
 const close=document.getElementById('verly-promo-close');
 const skip=document.getElementById('verly-promo-skip');
 const buy=document.getElementById('verly-vip-buy');
 let lastFocus=null;
 const SEEN_KEY='verly_promo_vip_november_2026_seen';
 // Gambar promo dan item spesifik November 2026, jangan tampilkan lagi setelah 30 November WIB.
 const validUntil=Date.parse('2026-12-01T00:00:00+07:00');
 function open(){
   lastFocus=document.activeElement;
   first.hidden=false;second.hidden=true;
   overlay.hidden=false;overlay.setAttribute('aria-hidden','false');
   document.body.classList.add('verly-promo-open');
   count.textContent='1 / 2';
   next.focus({preventScroll:true});
 }
 function showSecond(){
   first.hidden=true;second.hidden=false;
   count.textContent='2 / 2';
   close.focus({preventScroll:true});
 }
 function dismiss(){
   overlay.hidden=true;overlay.setAttribute('aria-hidden','true');
   document.body.classList.remove('verly-promo-open');
   try{sessionStorage.setItem(SEEN_KEY,'1')}catch(_){}
   if(lastFocus?.focus) lastFocus.focus({preventScroll:true});
 }
 next.addEventListener('click',showSecond);
 arrow.addEventListener('click',showSecond);
 close.addEventListener('click',dismiss);
 skip.addEventListener('click',dismiss);
 buy.addEventListener('click',()=>{
   dismiss();
   if(typeof window.selectProduct==='function'){
     window.selectProduct(11); // ID VIP Member (30 Hari) di tabel D1
   } else {
     // Graceful fallback jika katalog belum selesai dimuat
     document.getElementById('paket')?.scrollIntoView({behavior:'smooth'});
   }
 });
 overlay.addEventListener('click',(e)=>{
   if(e.target===overlay) dismiss();
 });
 document.addEventListener('keydown',(event)=>{
   if(overlay.hidden) return;
   if(event.key==='Escape') {event.preventDefault();dismiss();return;}
   if(event.key==='Tab'){
     const activeSlide=second.hidden?first:second;
     const active=[...activeSlide.querySelectorAll('button:not([disabled])'),skip].filter(el=>!el.hidden);
     const idx=active.indexOf(document.activeElement);
     if(event.shiftKey && idx<=0){event.preventDefault();active[active.length-1]?.focus();}
     if(!event.shiftKey && idx===active.length-1){event.preventDefault();active[0]?.focus();}
   }
 });
 // Ditampilkan sekali per tab/session. Jangan tampilkan bonus November di bulan lain.
 let alreadySeen=false;
 try{alreadySeen=sessionStorage.getItem(SEEN_KEY)==='1'}catch(_){}
 if(!alreadySeen && Date.now()<validUntil) open();
})();
