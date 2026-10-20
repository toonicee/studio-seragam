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
│       ├── +layout.ts                # Client-side render configuration (SSR disabled for WebGL)
│       ├── +layout.svelte            # Layout wrapper & global toast
│       ├── +page.svelte              # Halaman konfigurator utama
│       └── design/[id]/+page.svelte  # Shared design loader dari Supabase
├── .env.example                      # Template kredensial Supabase
├── package.json
└── vite.config.ts
```

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
