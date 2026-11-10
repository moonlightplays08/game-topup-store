'use strict';

// Data berikut hanya untuk PREVIEW sebelum database D1 dihubungkan.
// Setelah D1 aktif, daftar dan harga resmi selalu diambil dari /api/products.
const previewProducts = [
  {id:1,category:'coin',name:'Coin Goceng',amount_text:'1,5 juta Coin',price_idr:5000,bonus_text:'+500 ribu Coin',bonus_until:'2026-11-30',label:'GOCENG'},
  {id:2,category:'coin',name:'Coin Pemula',amount_text:'3 juta Coin',price_idr:10000,bonus_text:'+1,5 juta Coin',bonus_until:'2026-11-30',label:'FAVORIT'},
  {id:3,category:'coin',name:'Coin Pelajar',amount_text:'4,6 juta Coin',price_idr:16500,bonus_text:'+2,4 juta Coin',bonus_until:'2026-11-30',label:'PELAJAR'},
  {id:4,category:'coin',name:'Coin Sejati',amount_text:'6,4 juta Coin',price_idr:22000,bonus_text:'+3,6 juta Coin',bonus_until:'2026-11-30',label:'VALUE'},
  {id:5,category:'coin',name:'Coin Sultan',amount_text:'18 juta Coin',price_idr:55000,bonus_text:'+7 juta Coin + 200 DM',bonus_until:'2026-11-30',label:'SULTAN'},
  {id:6,category:'diamond',name:'DM Goceng',amount_text:'250 DM',price_idr:5000,bonus_text:'+50 DM',bonus_until:'2026-11-30',label:'GOCENG'},
  {id:7,category:'diamond',name:'DM Pemula',amount_text:'500 DM',price_idr:10000,bonus_text:'+150 DM',bonus_until:'2026-11-30',label:'FAVORIT'},
  {id:8,category:'diamond',name:'DM Pelajar',amount_text:'900 DM',price_idr:16500,bonus_text:'+300 DM',bonus_until:'2026-11-30',label:'PELAJAR'},
  {id:9,category:'diamond',name:'DM Sejati',amount_text:'1.400 DM',price_idr:22000,bonus_text:'+450 DM',bonus_until:'2026-11-30',label:'VALUE'},
  {id:10,category:'diamond',name:'DM Sultan',amount_text:'4.500 DM',price_idr:55000,bonus_text:'+550 DM + 3 juta Coin',bonus_until:'2026-11-30',label:'SULTAN'},
  {id:11,category:'membership',name:'VIP Member (30 Hari)',amount_text:'VIP selama 30 hari',price_idr:20000,bonus_text:'+1 juta Coin + 50 DM',bonus_until:'2026-11-30',label:'VIP'},
  {id:12,category:'membership',name:'Premium 1',amount_text:'Paket Premium 1',price_idr:25000,bonus_text:'+1,5 juta Coin + 50 DM',bonus_until:'2026-11-30',label:'PREMIUM'},
  {id:13,category:'membership',name:'Premium 2',amount_text:'Paket Premium 2',price_idr:25000,bonus_text:'+1,5 juta Coin + 50 DM',bonus_until:'2026-11-30',label:'PREMIUM'}
];
const $ = (id) => document.getElementById(id);
const rupiah = (n) => new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n);
const todayJakarta = () => new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const bonusActive = p => Boolean(p.bonus_text && p.bonus_until && todayJakarta() >= '2026-11-01' && todayJakarta() <= p.bonus_until);
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
let products = previewProducts;
let apiReady = false;
let category = 'coin';
let chosen = null;
let qty = 1;
const iconFor = p => p.category === 'coin' ? '🪙' : p.category === 'diamond' ? '💎' : '👑';
function renderProducts() {
  const query = $('search').value.trim().toLocaleLowerCase('id');
  const visible = products.filter(p => (category === 'all' || p.category === category) && `${p.name} ${p.amount_text} ${p.bonus_text||''}`.toLocaleLowerCase('id').includes(query));
  $('product-grid').innerHTML = visible.map(p => `<article class="product-card ${chosen?.id === p.id ? 'selected' : ''}"><div class="card-top"><div class="card-icon" aria-hidden="true">${iconFor(p)}</div><span class="card-badge">${escapeHtml(p.label || 'TOP UP')}</span></div><h3>${escapeHtml(p.name)}</h3><p class="product-main">${escapeHtml(p.amount_text)}</p><p class="product-bonus ${bonusActive(p) ? '' : 'muted'}">${bonusActive(p) ? `🎁 Bonus November: ${escapeHtml(p.bonus_text)}` : (p.category==='membership' ? 'Detail manfaat akan ditambahkan' : 'Paket tersedia')}</p><div class="card-bottom"><strong class="price">${rupiah(p.price_idr)}</strong><button type="button" class="choose-btn" data-id="${p.id}">${chosen?.id === p.id ? '✓ Terpilih' : 'Pilih →'}</button></div></article>`).join('') || '<div class="notice">Tidak ada paket sesuai pencarianmu.</div>';
  document.querySelectorAll('.choose-btn').forEach(btn => btn.addEventListener('click', () => selectProduct(Number(btn.dataset.id))));
}
function selectProduct(id) {
  chosen = products.find(p => p.id === id) || null;
  renderProducts(); updateSummary();
  $('order').scrollIntoView({behavior:'smooth',block:'start'});
}
function updateSummary() {
  $('qty-value').textContent = String(qty);
  $('qty-minus').disabled = qty <= 1;
  $('qty-plus').disabled = qty >= 10;
  if (!chosen) {
    $('selected-product').innerHTML = '<span class="empty-icon">◇</span><div><strong>Belum memilih paket</strong><p>Silakan pilih paket di katalog.</p></div><a href="#paket" class="mini-link">Pilih paket →</a>';
    $('summary-content').innerHTML = '<p>Belum ada produk dipilih.</p>';
    $('summary-total').textContent = 'Rp0';
    $('mobile-subtotal').textContent = 'Pilih paket untuk mulai';
    return;
  }
  const bonus = bonusActive(chosen) ? `🎁 Bonus November: ${chosen.bonus_text}` : 'Tidak ada bonus bulanan aktif';
  $('selected-product').innerHTML = `<span class="empty-icon">${iconFor(chosen)}</span><div><strong>${escapeHtml(chosen.name)}</strong><p>${escapeHtml(chosen.amount_text)} — ${rupiah(chosen.price_idr)}</p></div><a href="#paket" class="mini-link">Ganti →</a>`;
  $('summary-content').innerHTML = `<strong>${escapeHtml(chosen.name)}</strong><p>${escapeHtml(chosen.amount_text)}</p><p>${escapeHtml(bonus)}</p><p>Jumlah: ${qty} × ${rupiah(chosen.price_idr)}</p>`;
  const total = chosen.price_idr * qty;
  $('summary-total').textContent = rupiah(total);
  $('mobile-subtotal').textContent = rupiah(total);
}
function setCategory(v) {
  category = v;
  document.querySelectorAll('[data-category]').forEach(el=>el.setAttribute('aria-selected',String(el.dataset.category === v)));
  renderProducts();
}
function errorForm(message) { $('form-error').textContent = message; $('form-error').hidden = false; $('form-error').scrollIntoView({behavior:'smooth',block:'center'}); }
function normalizePhone(input) { const raw = String(input||'').replace(/[\s().-]/g,''); if (/^08\d{8,12}$/.test(raw)) return '62'+raw.slice(1); if (/^628\d{8,12}$/.test(raw)) return raw; return null; }
async function submitOrder(event) {
  event.preventDefault(); $('form-error').hidden = true;
  if (!chosen) return errorForm('Pilih paket dari katalog terlebih dahulu.');
  if (!$('checkout-form').reportValidity()) return;
  const phone = normalizePhone($('customer-phone').value);
  if (!phone) return errorForm('Nomor WhatsApp tidak valid. Gunakan awalan 08 atau 628.');
  if (!apiReady) return errorForm('Ini masih mode preview. Hubungkan Cloudflare Pages dan database D1 agar order bisa tersimpan. Belum ada data yang dikirim.');
  const button = $('submit-order'); button.disabled = true; button.textContent = 'Menyimpan pesanan...';
  const payload = {product_id:chosen.id,qty,name:$('customer-name').value.trim(),mabar_id:$('mabar-id').value.trim(),linked_account:$('linked-account').value.trim(),phone,email:$('customer-email').value.trim(),payment_method:'konfirmasi_wa',consent:$('consent').checked,website:$('website-field').value};
  try {
    const res = await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const data = await res.json();
    if (!res.ok || !data.ok) throw new Error(data.error || 'Gagal menyimpan pesanan.');
    const lines = [
      'Halo Admin VERLY GAMEDEV STORE, saya mau order:',
      '',`Kode Order: ${data.order_code}`,`Nama: ${payload.name}`,`ID Mabar: ${payload.mabar_id}`,
      `Nama Akun yang ditautkan: ${payload.linked_account}`,`NO HP: ${phone}`,
      `Orderan: ${data.product_name} (${data.amount_text})`,`Jumlah: ${qty}`,
      `Bonus: ${data.bonus_text || 'Tidak ada bonus aktif'}`,
      `Harga total: ${rupiah(data.total_idr)}`,
      'Pembayaran via: Konfirmasi dengan admin',
      '', 'Mohon instruksi pembayaran ya. Bukti transfer akan saya kirim di chat ini.'
    ];
    if (payload.email) lines.splice(7,0,`Email: ${payload.email}`);
    window.location.assign('https://wa.me/6288200240778?text='+encodeURIComponent(lines.join('\n')));
  } catch (e) { errorForm(e.message || 'Ada kendala. Coba lagi. Jangan mengirim pesanan ganda sebelum mengecek status.'); }
  finally { button.disabled = false; button.textContent = 'Pesan Sekarang via WhatsApp ↗'; }
}
async function trackOrder(event) {
  event.preventDefault();
  const result = $('track-result'); result.textContent = 'Mencari pesanan…';
  const code = $('track-code').value.trim().toUpperCase();
  const phone = normalizePhone($('track-phone').value);
  if (!phone) { result.textContent = 'Nomor WhatsApp tidak valid.'; return; }
  try {
    const res = await fetch('/api/check-order?code='+encodeURIComponent(code)+'&phone='+encodeURIComponent(phone),{cache:'no-store'});
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Tidak berhasil mengambil status.');
    result.textContent = `Pesanan ${data.order_code} • ${data.product_name} • ${rupiah(data.total_idr)} • Status: ${data.status_label}`;
  } catch(e) {result.textContent = e.message || 'Silakan coba lagi.';}
}
async function init() {
  $('category-tabs').addEventListener('click', e => { const btn=e.target.closest('[data-category]'); if(btn) setCategory(btn.dataset.category); });
  $('search').addEventListener('input',()=>{ if($('search').value.trim()) setCategory('all'); else renderProducts(); });
  $('qty-minus').addEventListener('click',()=>{qty=Math.max(1,qty-1);updateSummary();});
  $('qty-plus').addEventListener('click',()=>{qty=Math.min(10,qty+1);updateSummary();});
  $('checkout-form').addEventListener('submit',submitOrder);
  $('track-form').addEventListener('submit',trackOrder);
  $('promo-pill').hidden = !(todayJakarta() >= '2026-11-01' && todayJakarta() <= '2026-11-30');
  updateSummary();
  try {
    const res = await fetch('/api/products');
    const data = await res.json();
    if (!res.ok || !Array.isArray(data.products)) throw new Error('API belum terhubung');
    products = data.products; apiReady = true;
    $('catalog-status').textContent = '';
  } catch {
    $('catalog-status').textContent = 'MODE PREVIEW — Katalog dapat dilihat, tetapi order belum aktif sampai database Cloudflare D1 selesai dikonfigurasi.';
  }
  renderProducts();
}
document.addEventListener('DOMContentLoaded',init);
