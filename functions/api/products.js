// Cloudflare Pages Function: GET /api/products
export async function onRequestGet({env}) {
  if (!env.DB) return Response.json({error:'Database D1 belum dihubungkan.'},{status:503,headers:{'Cache-Control':'no-store'}});
  try {
    const {results} = await env.DB.prepare('SELECT id,category,name,amount_text,price_idr,bonus_text,bonus_until,label FROM products WHERE is_active=1 ORDER BY sort_order,id').all();
    return Response.json({products:results},{headers:{'Cache-Control':'public,max-age=60'}});
  } catch {
    return Response.json({error:'Tidak bisa membaca katalog.'},{status:500,headers:{'Cache-Control':'no-store'}});
  }
}
