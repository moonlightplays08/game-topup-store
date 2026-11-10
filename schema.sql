-- Jalankan sekali di Console Cloudflare D1.
-- Promo November berlaku 1-30 November 2026 (WIB) saja.
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('coin','diamond','membership')),
  name TEXT NOT NULL,
  amount_text TEXT NOT NULL,
  price_idr INTEGER NOT NULL CHECK (price_idr >= 0),
  bonus_text TEXT,
  bonus_until TEXT,
  label TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0,1))
);
CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_code TEXT NOT NULL UNIQUE,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  mabar_id TEXT NOT NULL,
  linked_account TEXT NOT NULL,
  product_id INTEGER NOT NULL REFERENCES products(id),
  product_name_snapshot TEXT NOT NULL,
  amount_text_snapshot TEXT NOT NULL,
  bonus_text_snapshot TEXT,
  unit_price_idr INTEGER NOT NULL,
  qty INTEGER NOT NULL CHECK(qty BETWEEN 1 AND 10),
  total_idr INTEGER NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'konfirmasi_wa',
  status TEXT NOT NULL DEFAULT 'menunggu_konfirmasi' CHECK(status IN ('menunggu_konfirmasi','menunggu_pembayaran','diproses','selesai','dibatalkan')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

INSERT OR IGNORE INTO products(id,category,name,amount_text,price_idr,bonus_text,bonus_until,label,sort_order) VALUES
(1,'coin','Coin Goceng','1,5 juta Coin',5000,'+500 ribu Coin','2026-11-30','GOCENG',10),
(2,'coin','Coin Pemula','3 juta Coin',10000,'+1,5 juta Coin','2026-11-30','FAVORIT',20),
(3,'coin','Coin Pelajar','4,6 juta Coin',16500,'+2,4 juta Coin','2026-11-30','PELAJAR',30),
(4,'coin','Coin Sejati','6,4 juta Coin',22000,'+3,6 juta Coin','2026-11-30','VALUE',40),
(5,'coin','Coin Sultan','18 juta Coin',55000,'+7 juta Coin + 200 DM','2026-11-30','SULTAN',50),
(6,'diamond','DM Goceng','250 DM',5000,'+50 DM','2026-11-30','GOCENG',60),
(7,'diamond','DM Pemula','500 DM',10000,'+150 DM','2026-11-30','FAVORIT',70),
(8,'diamond','DM Pelajar','900 DM',16500,'+300 DM','2026-11-30','PELAJAR',80),
(9,'diamond','DM Sejati','1.400 DM',22000,'+450 DM','2026-11-30','VALUE',90),
(10,'diamond','DM Sultan','4.500 DM',55000,'+550 DM + 3 juta Coin','2026-11-30','SULTAN',100),
(11,'membership','VIP Member (30 Hari)','VIP selama 30 hari',20000,'+1 juta Coin + 50 DM','2026-11-30','VIP',110),
(12,'membership','Premium 1','Paket Premium 1',25000,'+1,5 juta Coin + 50 DM','2026-11-30','PREMIUM',120),
(13,'membership','Premium 2','Paket Premium 2',25000,'+1,5 juta Coin + 50 DM','2026-11-30','PREMIUM',130);
