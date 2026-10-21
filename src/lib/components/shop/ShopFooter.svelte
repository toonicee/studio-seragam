<script lang="ts">
	import QrCode from '@lucide/svelte/icons/qr-code';
	import type { CategoryView } from '$lib/shop/types';
	import { waText } from '$lib/shop/wa';
	import ShopLogo from './ShopLogo.svelte';
	import WaButton from './WaButton.svelte';

	let { categories, waAdmin }: { categories: CategoryView[]; waAdmin: string } = $props();
	const year = new Date().getFullYear();
</script>

<footer class="mt-20 bg-ink text-white/80">
	<div class="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
		<div>
			<ShopLogo inverse />
			<p class="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
				Merchandise resmi Indah Expres untuk mitra. Semua produk dijual dengan sistem pre-order dan baru
				diproduksi saat target tercapai.
			</p>
		</div>
		<nav aria-label="Belanja">
			<h2 class="font-display text-lg font-bold tracking-wide text-white uppercase">Belanja</h2>
			<ul class="mt-4 space-y-2.5 text-sm">
				<li><a class="hover:text-white" href="/shop/katalog">Semua produk</a></li>
				{#each categories as c (c.id)}
					<li><a class="hover:text-white" href="/shop/katalog/{c.slug}">{c.name}</a></li>
				{/each}
			</ul>
		</nav>
		<nav aria-label="Layanan">
			<h2 class="font-display text-lg font-bold tracking-wide text-white uppercase">Layanan</h2>
			<ul class="mt-4 space-y-2.5 text-sm">
				<li><a class="hover:text-white" href="/shop/info/cara-kerja-po">Cara kerja PO</a></li>
				<li><a class="hover:text-white" href="/shop/info/faq">FAQ</a></li>
				<li><a class="hover:text-white" href="/shop/info/kebijakan-refund">Kebijakan refund</a></li>
				<li><a class="hover:text-white" href="/shop/cek-pesanan">Cek pesanan</a></li>
				<li><a class="hover:text-white" href="/shop/info/kontak">Kontak</a></li>
			</ul>
		</nav>
		<div>
			<h2 class="font-display text-lg font-bold tracking-wide text-white uppercase">Butuh bantuan?</h2>
			<p class="mt-4 text-sm text-white/60">Tanya kode mitra, pesanan, atau refund langsung ke admin.</p>
			<WaButton phone={waAdmin} text={waText.askAdmin()} class="mt-4" />
			<h2 class="mt-8 text-xs font-semibold tracking-widest text-white/50 uppercase">Pembayaran</h2>
			<div class="mt-3 flex flex-wrap items-center gap-2 text-xs font-bold text-ink">
				<span class="inline-flex h-8 items-center gap-1.5 rounded bg-white px-2.5"><QrCode class="size-4" />QRIS</span>
				<span class="inline-flex h-8 items-center rounded bg-white px-2.5 text-[#00a5cf]">GoPay</span>
				<span class="inline-flex h-8 items-center rounded bg-white/10 px-2.5 font-medium text-white/80">
					Semua e-wallet & m-banking
				</span>
			</div>
		</div>
	</div>
	<div class="border-t border-white/10">
		<div
			class="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between"
		>
			<p>© {year} Indah Expres. Harga sudah termasuk sablon/bordir logo.</p>
			<a href="/" data-sveltekit-reload class="hover:text-white">Desain seragam kustom di Studio Seragam →</a>
		</div>
	</div>
</footer>
