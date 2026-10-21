# Studio Seragam 3D 👔✨

Aplikasi visualizer dan konfigurator seragam 3D interaktif modern berbasis **SvelteKit 3**, **Svelte 5 (Runes)**, **Three.js**, dan **Supabase (PostgreSQL & Storage)**.

---

## 🚀 Fitur Utama

- **3D Procedural Garment Configurator**:
  - Pilihan model: **Kemeja Lengan Pendek**, **Kemeja Lengan Panjang** (dengan roll-up sleeves), **Kaos Oblong**, **Kaos Polo**, dan **Rompi Lapangan**.
  - Kustomisasi detail: Kerah (stand, mandarin, spread, button-down), saku (flap, double, cargo), kancing, dan kombinasi warna.
  - Simulasi tekstur kain prosedural: *Oxford Canvas*, *American Drill*, *Japan Drill*, *Ripstop Tactical*, *Combed 30s*, dan *Lacoste Pique*.
  - Shader normal map serat kain (*weave*), jahitan bordir (*satin embroidery*), dan ambient occlusion shading.
- **Custom Logo & Bordir**:
  - Upload file logo (PNG/JPG/SVG) dengan fitur *auto transparent background removal*.
  - Posisi slot logo interaktif: Dada Kiri, Dada Kanan, Punggung, dan Lengan Kiri/Kanan.
  - Tambah teks bordir custom dengan pilihan tipografi serif/sans/stencil.
- **Kalkulator Ukuran & Estimasi Harga**:
  - Rekomendasi ukuran otomatis berdasarkan tinggi dan berat badan (Fit: Slim, Regular, Loose).
  - Matriks ukuran tim (XS hingga 5XL) dengan breakdown biaya otomatis (diskon kuantitas & surcharge ukuran jumbo).
- **Database & Cloud Storage (Supabase)**:
  - Penyimpanan konfigurasi desain permanen dengan **Shareable Link** (`/design/[id]`).
  - Order submission langsung ke tabel `orders` PostgreSQL dengan status tracking (*draft*, *pending*, *confirmed*, *production*, *completed*).
  - Snapshot mockup visual resolusi tinggi (tampak depan & belakang).
  - **Graceful Offline Fallback**: Tetap berjalan lancar menggunakan `localStorage` jika kredensial Supabase belum diisi.

---

## 🛠️ Tech Stack

- **Framework**: [SvelteKit 3](https://kit.svelte.dev/) dengan [Svelte 5](https://svelte.dev/) (*Runes: `$state`, `$derived`, `$effect`*)
- **Language**: TypeScript
- **3D Graphics**: [Three.js](https://threejs.org/) + procedural buffer geometries
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security, Storage Buckets)
- **Styling**: Vanilla CSS bespoke *Sartorial / Tailor Luxury Dark Theme*

---

## 📁 Struktur Direktori

```
studio-seragam/
├── src/
│   ├── app.css                       # Design tokens, tema tailor luxury, & micro-animations
│   ├── lib/
│   │   ├── components/               # Komponen UI Svelte 5
│   │   │   ├── Canvas3D.svelte       # WebGL viewport & Three.js canvas
│   │   │   ├── Header.svelte         # Header bar, DB badge, theme switcher
│   │   │   ├── ModelTab.svelte       # Konfigurasi model & jenis kain
│   │   │   ├── ColorTab.svelte       # Palette warna & pola seragam
│   │   │   ├── LogoTab.svelte        # Logo upload, auto alpha, & bordir
│   │   │   ├── OrderTab.svelte       # Tabel size, rekomendasi fit, PIC order
│   │   │   ├── TapeFooter.svelte     # Footer visual pita meteran penjahit
│   │   │   ├── MockupModal.svelte    # Modal HD mockup, share link, & WhatsApp order
│   │   │   ├── OrdersModal.svelte    # Modal riwayat pemesanan dari Database
│   │   │   └── Toast.svelte          # Notifikasi feedback sistem
│   │   ├── constants/
│   │   │   └── catalog.ts            # Produk, kain, warna, swatch, & pricing formula
│   │   ├── stores/
│   │   │   └── uniform.svelte.ts     # State management reaktif Svelte 5 runes
│   │   ├── supabase/
│   │   │   ├── client.ts             # Supabase client initializer
│   │   │   ├── schema.sql            # Skema PostgreSQL, RLS, & bucket storage
│   │   │   └── service.ts            # Service API (save/load design, submit order)
│   │   ├── three/
│   │   │   ├── engine.ts             # Three.js runtime, orbit controls, & render loop
│   │   │   ├── procedural.ts         # Geometri parametrik baju, kerah, lengan, saku
│   │   │   └── textures.ts           # Generator normal map serat kain & logo canvas
│   │   └── types/
│   │       └── uniform.ts            # Type definitions TypeScript
│   └── routes/
│       ├── (studio)/                 # Konfigurator (tanpa SSR karena WebGL)
│       │   ├── +layout.svelte        # app.css, tema, & toast konfigurator
│       │   ├── +page.svelte          # Halaman konfigurator utama
│       │   ├── katalog/              # Katalog seragam
│       │   └── design/[id]/          # Shared design loader dari Supabase
│       └── shop/                     # Toko merchandise (SSR, Tailwind + shadcn-svelte)
│           ├── (store)/              # Beranda, katalog, produk, keranjang, checkout, pesanan
│           └── admin/                # Halaman admin toko
├── drizzle/                          # Migrasi SQL database toko
├── Dockerfile, docker-compose.yml, Caddyfile   # Deploy toko + konfigurator ke VPS
├── .env.example                      # Template variabel lingkungan
├── package.json
└── vite.config.ts
```

---

## 🛍️ Toko Merchandise (`/shop`)

Toko merchandise Indah Expres khusus mitra dengan sistem **pre-order (PO)**, berjalan di aplikasi yang sama.

- **Pembeli (tanpa akun):** katalog per kategori, halaman produk dengan progres PO, keranjang, checkout dengan
  kode mitra + nomor WhatsApp, bayar lewat **QRIS statis GoPay Merchant** dengan kode unik 1–999, unggah bukti
  bayar, dan halaman status pesanan lewat link unik (`/shop/pesanan/…`).
- **Aturan PO:** tiap produk punya target dan deadline 23:59 WIB. Hanya pesanan yang dikonfirmasi admin yang
  dihitung. Proses otomatis tiap jam menutup PO: target tercapai → produksi; tidak tercapai → pesanan batal
  dan masuk daftar refund.
- **Admin (`/shop/admin`):** dashboard, konfirmasi pembayaran, pesanan (kirim + resi, batal), produk & PO
  (foto, ukuran, buka PO berikutnya, rekap ukuran, ekspor CSV), refund, mitra (impor CSV), dan pengaturan
  (QRIS, nomor WhatsApp admin, batas bayar, ongkir, halaman info, kata sandi).
- **Stack:** SvelteKit 3 + adapter-node, Tailwind v4 + shadcn-svelte, Swiper Element, Better Auth (admin),
  Superforms + Zod, Drizzle ORM + SQLite, sharp, croner. Semua gratis dan berjalan di server sendiri.

### Menjalankan toko secara lokal

```bash
cp .env.example .env      # isi BETTER_AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm install
npm run dev               # buka http://localhost:5173/shop
```

- Database dibuat otomatis di `./data/shop.db` (migrasi berjalan saat server start).
- `SEED_SAMPLE=1` mengisi katalog contoh; `SEED_DEMO_ORDERS=1` menambah mitra & pesanan contoh
  (kode mitra uji: `DEMO`, WhatsApp `0812-3456-7890`). Jangan aktifkan data demo di server asli.
- Admin pertama dibuat dari `ADMIN_EMAIL` / `ADMIN_PASSWORD` bila belum ada admin.
- Ubah skema di `src/lib/server/db/schema.ts`, lalu `npm run db:generate` untuk membuat migrasi baru.

### Tes

```bash
npm test             # unit test logika PO, checkout, dan proses otomatis (Vitest)
npx playwright install chromium   # sekali saja
npm run test:e2e     # alur pembeli & admin di build produksi (Playwright)
```

### Deploy ke VPS (Docker)

Butuh VPS Linux dengan Docker + Docker Compose, dan domain (mis. `shop.indahexpres.com`) yang sudah
mengarah ke IP VPS. Port 80 dan 443 harus terbuka.

```bash
git clone <repo> studio-seragam && cd studio-seragam
cp .env.example .env      # isi SHOP_DOMAIN, BETTER_AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
                          # SEED_SAMPLE=1 bila ingin mulai dari katalog contoh, SEED_DEMO_ORDERS=0
docker compose up -d --build
```

Caddy mengurus HTTPS (Let's Encrypt) otomatis. Setelah jalan:

1. Masuk ke `https://SHOP_DOMAIN/shop/admin`, lalu ganti kata sandi di **Pengaturan → Akun**.
2. **Pengaturan → Pembayaran:** unggah gambar QRIS statis GoPay Merchant dan isi nomor WhatsApp admin.
3. **Mitra:** tambah mitra atau impor CSV (`nama,kode,whatsapp,kota`).
4. **Produk & PO:** ganti foto dan harga contoh, lalu buka PO.

**Update aplikasi:** `git pull && docker compose up -d --build`. Database dan unggahan tersimpan di volume
`shop-data`, jadi tidak hilang.

**Backup:** salin isi volume, mis.
`docker run --rm -v studio-seragam_shop-data:/data -v "$PWD":/backup alpine tar czf /backup/toko-$(date +%F).tgz -C /data .`

---

## ⚙️ Cara Menjalankan Secara Lokal

### 1. Clone & Install Dependensi

```bash
git clone https://github.com/toonicee/studio-seragam.git
cd studio-seragam
npm install
```

### 2. Setup Supabase (Opsional tapi Direkomendasikan)

1. Buat project baru di [Supabase Dashboard](https://supabase.com/dashboard).
2. Buka **SQL Editor** di Supabase, lalu jalankan seluruh script yang ada di [`src/lib/supabase/schema.sql`](src/lib/supabase/schema.sql).
3. Salin kredensial API Supabase dari menu **Project Settings > API**.
4. Buat file `.env` di root project:

```bash
cp .env.example .env
```

Lalu isi `.env`:

```env
PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

> **Catatan:** Jika `.env` tidak diisi, aplikasi akan otomatis beralih ke mode **Local Demo Mode** (menggunakan browser `localStorage`) sehingga aplikasi tetap dapat dicoba secara offline tanpa error.

### 3. Jalankan Development Server

```bash
npm run dev
```

Buka peramban di [http://localhost:5173](http://localhost:5173).

### 4. Build untuk Production

```bash
npm run check
npm run build
npm run preview
```

---

## 🗄️ Skema Database Supabase

Skema lengkap tersedia di [`src/lib/supabase/schema.sql`](src/lib/supabase/schema.sql), mencakup:
- **Tabel `designs`**: Menyimpan ID unik, nama desain, state konfigurasi lengkap (JSONB), URL mockup depan/belakang, dan ID pembuat.
- **Tabel `orders`**: Menyimpan referensi desain, rincian kuantitas per ukuran, total biaya, identitas pemesan (PIC, No. WhatsApp, Nama Organisasi/Instansi), serta status pengerjaan seragam.
- **Storage Buckets**: `logos` untuk file logo pelanggan dan `mockups` untuk snapshot render seragam.
- **RLS (Row Level Security)**: Mengizinkan public read & insert untuk pesanan dan desain dengan proteksi data.

---

## 📄 Lisensi

MIT License © 2026 Studio Seragam
