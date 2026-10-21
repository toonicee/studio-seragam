/** Isi awal halaman info (markdown). Setelah itu admin mengubahnya dari halaman Pengaturan. */

export const INFO_PAGE_CONTENT = [
	{
		slug: 'cara-kerja-po',
		title: 'Cara Kerja PO',
		body: `Semua merchandise Indah Expres dijual dengan sistem **pre-order (PO)**. Produk baru diproduksi jika jumlah pesanan mencapai target sebelum PO ditutup.

## Langkahnya

1. **Pesan & bayar.** Pilih produk dan ukuran, isi kode mitra, lalu bayar lunas lewat QRIS dengan nominal persis (sudah termasuk kode unik). Unggah bukti bayar di halaman pesanan.
2. **Pembayaran dikonfirmasi.** Admin mencocokkan pembayaran di GoPay Merchant. Setelah lunas, pesanan Anda ikut dihitung di progres PO.
3. **Target terkumpul.** PO tetap dibuka sampai tanggal tutup pukul 23:59 WIB, walaupun target sudah tercapai.
4. **Produksi & kirim.** Jika target tercapai, produk diproduksi lalu dikirim lewat Indah Expres. Nomor resi muncul di halaman pesanan.

## Jika target tidak tercapai

Semua pesanan untuk produk itu dibatalkan dan dana dikembalikan **100%**, termasuk kode unik. Admin menghubungi Anda lewat WhatsApp untuk menanyakan tujuan refund.

## Penting

- Pesanan yang belum dibayar sampai batas bayar dibatalkan otomatis.
- Pembayaran yang belum dikonfirmasi saat PO ditutup ikut dibatalkan, jadi bayar dan unggah bukti secepatnya.
- Ukuran tidak bisa ditukar setelah PO ditutup. Cek tabel ukuran sebelum memesan.`
	},
	{
		slug: 'faq',
		title: 'FAQ',
		body: `## Siapa yang bisa membeli?

Toko ini khusus mitra Indah Expres. Saat checkout Anda perlu kode mitra dan nomor WhatsApp yang terdaftar. Belum punya kode mitra? Hubungi admin lewat WhatsApp.

## Apa itu sistem PO?

Produk dibuat setelah pesanan terkumpul. Setiap produk punya target jumlah dan tanggal tutup. Jika target tercapai, produk diproduksi; jika tidak, dana dikembalikan 100%.

## Kapan barang dikirim?

Estimasi kirim tertulis di halaman produk: tanggal tutup PO ditambah lama produksi. Pesanan berisi beberapa produk dikirim sekaligus setelah semuanya selesai diproduksi.

## Kenapa nominal bayar ada angka uniknya?

Kode unik 1–999 rupiah membuat setiap pesanan punya nominal berbeda, sehingga admin bisa mengenali pembayaran Anda di riwayat QRIS. Bayar persis sesuai nominal yang tertulis.

## Bagaimana cara membayar?

Scan QRIS di halaman pesanan dengan aplikasi e-wallet atau mobile banking, masukkan nominal persis, lalu unggah tangkapan layar bukti bayar.

## Berapa lama konfirmasi pembayaran?

Admin mengecek pembayaran setiap hari. Status pesanan berubah menjadi **Lunas** setelah dikonfirmasi.

## Bisakah saya membatalkan pesanan?

Bisa selama PO masih dibuka: hubungi admin lewat WhatsApp dan dana kembali penuh. Setelah PO ditutup, pesanan tidak bisa dibatalkan.

## Bisakah tukar ukuran?

Tidak bisa setelah PO ditutup karena produk dibuat sesuai pesanan. Cek tabel ukuran di halaman produk sebelum memesan.

## Saya kehilangan link pesanan

Buka **Cek Pesanan**, lalu masukkan nomor pesanan dan nomor WhatsApp Anda.`
	},
	{
		slug: 'kebijakan-refund',
		title: 'Kebijakan Refund',
		body: `Dana Anda dikembalikan **100%** jika:

- PO tidak mencapai target saat ditutup;
- Anda membatalkan pesanan selama PO masih dibuka;
- pembayaran Anda belum sempat dikonfirmasi saat PO ditutup.

## Cara refund

1. Admin menghubungi Anda lewat WhatsApp dan menanyakan tujuan refund: GoPay atau rekening bank.
2. Admin mentransfer dana lalu menandai pesanan **Sudah direfund**.
3. Status refund terlihat di halaman pesanan Anda.

Refund diproses manual karena pembayaran memakai QRIS statis. Ongkir ikut dikembalikan jika seluruh isi pesanan batal. Jika hanya sebagian produk yang gagal, yang dikembalikan adalah harga produk tersebut.`
	},
	{
		slug: 'kontak',
		title: 'Kontak',
		body: `Ada pertanyaan tentang pesanan, kode mitra, atau refund? Hubungi admin Toko Indah Expres lewat WhatsApp dan sertakan nomor pesanan Anda agar cepat dibantu.`
	}
];
