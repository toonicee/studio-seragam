<script lang="ts">
	import QrCode from '@lucide/svelte/icons/qr-code';
	import { t } from '$lib/shop/i18n.svelte';
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
			<p class="mt-4 max-w-xs text-sm leading-relaxed text-white/60">{t('footer.about')}</p>
		</div>
		<nav aria-label={t('footer.shop')}>
			<h2 class="font-display text-lg font-bold tracking-wide text-white uppercase">{t('footer.shop')}</h2>
			<ul class="mt-4 space-y-2.5 text-sm">
				<li><a class="hover:text-white" href="/shop/katalog">{t('common.allProducts')}</a></li>
				{#each categories as c (c.id)}
					<li><a class="hover:text-white" href="/shop/katalog/{c.slug}">{c.name}</a></li>
				{/each}
			</ul>
		</nav>
		<nav aria-label={t('footer.service')}>
			<h2 class="font-display text-lg font-bold tracking-wide text-white uppercase">{t('footer.service')}</h2>
			<ul class="mt-4 space-y-2.5 text-sm">
				<li><a class="hover:text-white" href="/shop/info/cara-kerja-po">{t('nav.howItWorks')}</a></li>
				<li><a class="hover:text-white" href="/shop/info/faq">{t('nav.faq')}</a></li>
				<li><a class="hover:text-white" href="/shop/info/kebijakan-refund">{t('nav.refundPolicy')}</a></li>
				<li><a class="hover:text-white" href="/shop/cek-pesanan">{t('nav.checkOrder')}</a></li>
				<li><a class="hover:text-white" href="/shop/info/kontak">{t('footer.contact')}</a></li>
			</ul>
		</nav>
		<div>
			<h2 class="font-display text-lg font-bold tracking-wide text-white uppercase">{t('footer.help')}</h2>
			<p class="mt-4 text-sm text-white/60">{t('footer.helpText')}</p>
			<WaButton phone={waAdmin} text={waText.askAdmin()} class="mt-4" />
			<h2 class="mt-8 text-xs font-semibold tracking-widest text-white/50 uppercase">{t('footer.payment')}</h2>
			<div class="mt-3 flex flex-wrap items-center gap-2 text-xs font-bold text-ink">
				<span class="inline-flex h-8 items-center gap-1.5 rounded bg-white px-2.5"><QrCode class="size-4" />QRIS</span>
				<span class="inline-flex h-8 items-center rounded bg-white px-2.5 text-[#00a5cf]">GoPay</span>
				<span class="inline-flex h-8 items-center rounded bg-white/10 px-2.5 font-medium text-white/80">{t('footer.wallets')}</span>
			</div>
		</div>
	</div>
	<div class="border-t border-white/10">
		<div class="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
			<p>{t('footer.copyright', { year })}</p>
			<a href="/" data-sveltekit-reload class="hover:text-white">{t('footer.studio')}</a>
		</div>
	</div>
</footer>
