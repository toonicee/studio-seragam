<script lang="ts">
	import ShoppingCart from '@lucide/svelte/icons/shopping-cart';
	import Users from '@lucide/svelte/icons/users';
	import Factory from '@lucide/svelte/icons/factory';
	import Truck from '@lucide/svelte/icons/truck';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';

	const steps = [
		{ icon: ShoppingCart, title: 'Pesan & bayar', text: 'Pilih ukuran, bayar lunas lewat QRIS, lalu unggah bukti bayar.' },
		{ icon: Users, title: 'Target terkumpul', text: 'Pesanan lunas dihitung di progres PO sampai tanggal tutup.' },
		{ icon: Factory, title: 'Produksi', text: 'Target tercapai? Produk dibuat sesuai jumlah dan ukuran pesanan.' },
		{ icon: Truck, title: 'Dikirim', text: 'Dikirim lewat Indah Expres. Resi muncul di halaman pesanan.' }
	];
</script>

<section class="rounded-lg bg-surface px-5 py-10 md:px-10 md:py-12">
	<div class="max-w-2xl">
		<p class="text-xs font-bold tracking-[0.2em] text-brand uppercase">Sistem pre-order</p>
		<h2 class="display mt-2 text-[34px] md:text-[44px]">Cara kerja PO</h2>
		<p class="mt-2 text-muted-foreground">
			Setiap produk punya target jumlah dan tanggal tutup. Produk baru diproduksi kalau targetnya tercapai.
		</p>
	</div>
	<ol class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
		{#each steps as s, i (s.title)}
			<li class="relative rounded-lg bg-white p-5">
				<span class="font-display text-5xl leading-none font-bold text-brand/15">{i + 1}</span>
				<span class="absolute top-5 right-5 grid size-10 place-items-center rounded-full bg-brand text-white">
					<s.icon class="size-5" />
				</span>
				<h3 class="mt-3 text-lg font-semibold">{s.title}</h3>
				<p class="mt-1 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
			</li>
		{/each}
	</ol>
	<div class="mt-4 flex flex-col gap-3 rounded-lg border border-brand/20 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
		<p class="flex items-start gap-3 text-sm">
			<RotateCcw class="mt-0.5 size-5 shrink-0 text-brand" />
			<span><b>Target tidak tercapai?</b> Semua pesanan dibatalkan dan dana dikembalikan 100%, termasuk kode unik.</span>
		</p>
		<a href="/shop/info/cara-kerja-po" class="shrink-0 text-sm font-semibold text-brand hover:underline">Selengkapnya →</a>
	</div>
</section>
