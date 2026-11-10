# VERLY GAMEDEV STORE — Starter Website + Cloudflare D1

Website top up game dengan tema **biru elektrik, kuning, navy/hitam**, katalog 13 produk, checkout WhatsApp, cek transaksi, dan database Cloudflare D1.

**Repository:** `moonlightplays08/game-topup-store`  
**Domain yang direncanakan:** `verlygamedev.store`  
**WhatsApp admin:** `088200240778` (`6288200240778` dalam link WhatsApp)

## Fitur saat ini

- Halaman responsif dengan header, running announcement, animasi logo, search, kategori produk, dan ringkasan pesanan.
- Katalog produk diambil dari database D1 **setelah database aktif**. Sebelum itu tampil dalam **mode preview**, tanpa membuat pesanan sungguhan.
- Form order menyimpan data pelanggan dan pesanan ke D1, **baru kemudian** membuka WhatsApp.
- Kode pesanan acak dan fitur cek status memakai kode + nomor WhatsApp.
- Bukti transfer dikirim melalui WhatsApp, bukan ke database.
- Bonus November 2026 aktif hanya pada **1–30 November 2026 waktu Jakarta**. Bonus disalin sebagai *snapshot* saat order dibuat.
- VIP/Premium: detail manfaat belum disertakan, karena masih menunggu foto dari pemilik toko.
- Metode pembayaran: sementara **konfirmasi ke admin lewat WhatsApp**; QRIS/DANA/bank tidak diklaim tersedia sebelum dikonfirmasi.

**Belum dibuat:** login/daftar customer, dashboard admin, pembayaran otomatis, kode diskon, upload bukti, verifikasi pembayaran otomatis. Jangan menambahkan tombol login palsu pada website publik. Status order dapat diperbarui sementara lewat D1 Console. Admin panel aman bisa dibuat pada tahap berikutnya.

## A. Upload ke GitHub

1. Ekstrak berkas ZIP di komputer.
2. Buka `https://github.com/moonlightplays08/game-topup-store`.
3. Pilih **Add file → Upload files** (pada layout baru mungkin ada ikon `+` di sebelah `Go to file`).
4. Seret **isi folder** `verly-gamedev-store` ke area upload; pastikan folder `assets/`, `functions/api/`, `index.html`, `privacy.html`, `schema.sql`, `_headers`, dan README masuk ke **root** repository, bukan dibungkus folder tambahan.
5. Jika GitHub menanyakan apakah akan menimpa `README.md`, izinkan untuk memakai panduan baru ini.
6. Pilih **Commit changes**. Jika drag folder tidak berfungsi, gunakan GitHub Desktop atau Git CLI untuk commit folder beserta subfoldernya.

## B. Deploy Cloudflare Pages

1. Buat/login akun Cloudflare di `https://dash.cloudflare.com`.
2. Buka **Workers & Pages → Create application → Pages → Connect to Git**.
3. Izinkan Cloudflare mengakses repository `moonlightplays08/game-topup-store`.
4. Pilih branch `main`, preset `None`, **Build command kosong**, **Build output directory** `.` (root). Bila UI tidak menerima `.`, pilih opsi tanpa framework dan ikuti instruksi output directory pada layar.
5. Deploy. Website preview bisa dibuka di URL `*.pages.dev`, tetapi **checkout belum aktif** sampai D1 dihubungkan.

**PENTING:** Gunakan integrasi Git, bukan unggah ZIP langsung di Cloudflare Dashboard. Proyek ini menggunakan **Pages Functions** dalam folder `/functions`.

## C. Buat dan isi database D1

1. Dashboard Cloudflare → **D1 SQL database** (lokasi menu bisa berubah) → **Create database**.
2. Nama contoh: `verly-gamedev-db`.
3. Buka database → **Console**.
4. Buka `schema.sql`, salin isinya ke console, lalu klik **Execute**. SQL membuat tabel `products`, `customers`, `orders` dan memasukkan 13 produk. **Jangan tempel data pribadi pelanggan ke repository GitHub.**
5. Buka **Workers & Pages → proyek Pages → Settings → Bindings → Add → D1 database**.
6. Isi variable name **`DB`** (huruf kapital). Pilih `verly-gamedev-db`.
7. Simpan, lalu **redeploy** versi Production agar binding aktif.
8. Kunjungi `https://URL-PAGES-KAMU.pages.dev/api/products`. Jika keluar JSON daftar produk, koneksi berhasil.

## D. Uji checkout

1. Buka website Pages → pilih paket → isi form dengan **data uji milik sendiri** → Pesan Sekarang.
2. Pastikan WhatsApp terbuka dengan kode order, nama, produk, harga, bonus, dan format pesan.
3. Dashboard D1 → Console → jalankan:

```sql
SELECT order_code, product_name_snapshot, total_idr, status, created_at
FROM orders ORDER BY id DESC LIMIT 10;
```

4. Untuk menguji status, pakai kode dari pesan dan nomor WA yang digunakan.
5. Admin dapat mengubah status secara MANUAL di Console sementara (gunakan kode order yang benar):

```sql
UPDATE orders SET status='diproses' WHERE order_code='GANTI_KODE_ORDER';
```

Pilihan status: `menunggu_konfirmasi`, `menunggu_pembayaran`, `diproses`, `selesai`, `dibatalkan`.

## E. Domain sendiri

Setelah tes sukses, buka Cloudflare Pages → **Custom domains** → tambah `verlygamedev.store`. Ikuti petunjuk DNS dan nameserver Cloudflare, lalu ubah di panel registrar domain. Jangan mengubah DNS sebelum tahu catatan DNS lain yang sudah dipakai.

## Keamanan dan batasan sebelum peluncuran publik

- Database **tidak pernah** diakses langsung dari browser; API memakai query berparameter dan harga dihitung ulang di server.
- D1 hanya menyimpan data pesanan teks. Foto bukti transfer tetap melalui WhatsApp.
- Data pelanggan dan kredensial Cloudflare **jangan** dimasukkan ke repository GitHub.
- **Tambahkan Cloudflare Turnstile dan rate limiting** untuk POST `/api/orders` serta GET `/api/check-order` sebelum website dibuka besar-besaran, agar tidak mudah terkena spam dan tebakan kode order. Sampel ini **belum** memasangnya; checkbox persetujuan bukan anti-bot.
- Pastikan ada kontrol akses admin yang kuat sebelum membuat dashboard pelanggan. **Jangan** membuat route GET untuk seluruh daftar customer tanpa login/otorisasi.
- Setelah desain final, minta foto manfaat VIP/Premium untuk mengisi konten dengan akurat.
- Karena pembayaran manual via WhatsApp, status tidak berubah otomatis saat bukti transfer diterima.

Referensi resmi:
- https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/
- https://developers.cloudflare.com/pages/functions/get-started/
- https://developers.cloudflare.com/pages/functions/bindings/
- https://developers.cloudflare.com/d1/get-started/
