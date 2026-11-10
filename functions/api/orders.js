// Cloudflare Pages Function: POST /api/orders
// Jangan pernah menerima harga, bonus, atau total dari browser: ambil dari D1.
function json(data, status=200) {return Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});}
const phoneNormal = s => { const v=String(s||'').replace(/[\s().-]/g,''); if(/^08\d{8,12}$/.test(v))return '62'+v.slice(1); return /^628\d{8,12}$/.test(v)?v:null;};
const todayWIB = () => new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
function validText(v,max) {return typeof v==='string' && v.trim().length>=1 && v.trim().length<=max;}
export async function onRequestPost({request,env}) {
  if (!env.DB) return json({error:'Database belum aktif. Hubungi admin.'},503);
  const origin=request.headers.get('Origin');
  if(origin && origin!==new URL(request.url).origin) return json({error:'Permintaan tidak diizinkan.'},403);
  if (!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'Format data tidak sesuai.'},415);
  if(Number(request.headers.get('Content-Length')||'0')>8000)return json({error:'Data terlalu besar.'},413);
  let data;
  try {data=await request.json();} catch {return json({error:'JSON tidak valid.'},400);}
  if (!data || typeof data !== 'object' || data.website) return json({error:'Permintaan tidak valid.'},400);
  const phone=phoneNormal(data.phone);
  const productId=Number(data.product_id),qty=Number(data.qty);
  if(!validText(data.name,80)||!validText(data.mabar_id,50)||!validText(data.linked_account,100)||!phone||!Number.isInteger(productId)||!Number.isInteger(qty)||qty<1||qty>10||data.consent!==true) return json({error:'Mohon lengkapi data yang wajib dengan benar.'},400);
  const email=String(data.email||'').trim();
  if(email && (email.length>120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)))return json({error:'Format email tidak sesuai.'},400);
  if(data.payment_method!=='konfirmasi_wa') return json({error:'Metode pembayaran tidak dikenali.'},400);
  try {
    const p=await env.DB.prepare('SELECT id,name,amount_text,price_idr,bonus_text,bonus_until FROM products WHERE id=? AND is_active=1').bind(productId).first();
    if(!p) return json({error:'Paket tidak ditemukan atau sudah tidak aktif.'},404);
    const now=todayWIB();
    const bonus=(p.bonus_text && now>='2026-11-01' && now<=p.bonus_until)?p.bonus_text:null;
    const orderCode=`VG-${now.replaceAll('-','')}-${crypto.randomUUID().replaceAll('-','').slice(0,12).toUpperCase()}`;
    const statements=[
      env.DB.prepare('INSERT INTO customers(phone,name,email) VALUES (?,?,?) ON CONFLICT(phone) DO UPDATE SET name=excluded.name,email=COALESCE(excluded.email,customers.email),updated_at=datetime(\'now\')').bind(phone,data.name.trim(),email||null),
      env.DB.prepare('INSERT INTO orders(order_code,customer_id,mabar_id,linked_account,product_id,product_name_snapshot,amount_text_snapshot,bonus_text_snapshot,unit_price_idr,qty,total_idr,payment_method) VALUES (?,(SELECT id FROM customers WHERE phone=?),?,?,?,?,?,?,?,?,?,?)').bind(orderCode,phone,data.mabar_id.trim(),data.linked_account.trim(),p.id,p.name,p.amount_text,bonus,p.price_idr,qty,p.price_idr*qty,'konfirmasi_wa')
    ];
    await env.DB.batch(statements);
    return json({ok:true,order_code:orderCode,product_name:p.name,amount_text:p.amount_text,bonus_text:bonus,total_idr:p.price_idr*qty},201);
  } catch(e) {console.error('Failed to create order', e?.message);return json({error:'Pesanan belum berhasil tersimpan. Coba lagi atau hubungi admin.'},500);}
}
