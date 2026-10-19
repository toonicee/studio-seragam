# Studio Seragam

Desain seragam kerja secara 3D di browser: Kemeja Pendek, Kemeja Panjang, Kaos, Polo, dan Rompi. Pengguna memilih model, warna, pola, logo (bordir/DTF), lalu mengisi jumlah per ukuran dan menyalin ringkasan order.

## Struktur

```
index.html    # seluruh aplikasi: HTML + CSS + JavaScript (ES module)
vercel.json   # header keamanan dasar (opsional)
```

Situs statis murni, **tanpa build step** dan tanpa `npm install`.
Three.js 0.165.0 dimuat dari CDN jsDelivr melalui `importmap`, font dari Google Fonts.
Desain pengguna tersimpan di `localStorage` browser masing-masing (key `studio-seragam-v3`).

## Jalankan lokal

ES module tidak jalan lewat `file://`, jadi pakai server lokal:

```bash
npx serve .
# atau
python3 -m http.server 5173
```

## Deploy ke Vercel

1. Push folder ini ke repo GitHub.
2. Di Vercel: **Add New → Project → Import** repo tersebut.
3. Framework Preset: **Other**. Build Command dan Output Directory: **biarkan kosong**.
4. Deploy. Setiap push ke branch `main` akan otomatis deploy ulang.

Atau lewat CLI: `npx vercel` lalu `npx vercel --prod`.

## Mengubah harga & minimal order

Buka `index.html`, cari `const TAMPILKAN_HARGA` (di bagian atas script):

```js
const TAMPILKAN_HARGA = false;   // ubah ke true untuk menampilkan harga
const HARGA = {
  kemeja: { unione: [158600, 130900], am1919: [164900, 135900] },   // [harga normal, harga promo]
  ...
  rompi:  { taslan: null, drill: null, ripstop: null },            // null = "Harga menyusul"
};
const MIN_ORDER = { kemeja: 36, kemejaPanjang: 36, kaos: 1, polo: 1, rompi: null };
```

Commit & push, Vercel deploy otomatis.
