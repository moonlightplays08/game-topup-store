// Cloudflare Pages Function: GET /api/check-order?code=...&phone=...
function phoneNormal(s){const v=String(s||'').replace(/[\s().-]/g,'');if(/^08\d{8,12}$/.test(v))return '62'+v.slice(1);return /^628\d{8,12}$/.test(v)?v:null;}
const statusLabels={menunggu_konfirmasi:'Menunggu konfirmasi',menunggu_pembayaran:'Menunggu pembayaran',diproses:'Sedang diproses',selesai:'Selesai',dibatalkan:'Dibatalkan'};
export async function onRequestGet({request,env}) {
  const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
  if(!env.DB)return Response.json({error:'Database belum aktif.'},{status:503,headers});
  const url=new URL(request.url),code=(url.searchParams.get('code')||'').toUpperCase().trim(),phone=phoneNormal(url.searchParams.get('phone'));
  if(!/^VG-\d{8}-[A-F0-9]{12}$/.test(code)||!phone)return Response.json({error:'Kode pesanan atau nomor WA tidak valid.'},{status:400,headers});
  try{
    const row=await env.DB.prepare('SELECT o.order_code,o.product_name_snapshot,o.total_idr,o.status FROM orders o JOIN customers c ON c.id=o.customer_id WHERE o.order_code=? AND c.phone=?').bind(code,phone).first();
    if(!row)return Response.json({error:'Pesanan tidak ditemukan. Cek kode dan nomor WA.'},{status:404,headers});
    return Response.json({order_code:row.order_code,product_name:row.product_name_snapshot,total_idr:row.total_idr,status_label:statusLabels[row.status]||'Menunggu pembaruan'},{headers});
  } catch {return Response.json({error:'Status pesanan belum bisa diperiksa.'},{status:500,headers});}
}
