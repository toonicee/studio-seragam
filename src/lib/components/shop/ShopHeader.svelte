<script lang="ts">
	import { page } from '$app/state';
	import * as Sheet from '$lib/components/ui/sheet';
	import Menu from '@lucide/svelte/icons/menu';
	import Search from '@lucide/svelte/icons/search';
	import ShoppingCart from '@lucide/svelte/icons/shopping-cart';
	import PackageSearch from '@lucide/svelte/icons/package-search';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import { LANGS, type Lang } from '$lib/shop/i18n';
	import { lang, setLang, t } from '$lib/shop/i18n.svelte';
	import type { CategoryView } from '$lib/shop/types';
	import { cn } from '$lib/utils';
	import ShopLogo from './ShopLogo.svelte';

	let {
		categories,
		cartCount,
		onOpenCart
	}: { categories: CategoryView[]; cartCount: number; onOpenCart: () => void } = $props();

	let menuOpen = $state(false);

	const nav = $derived([
		{ href: '/shop/katalog', label: t('common.allProducts') },
		...categories.map((c) => ({ href: `/shop/katalog/${c.slug}`, label: c.name }))
	]);

	const isActive = (href: string) =>
		href === '/shop/katalog' ? page.url.pathname === href : page.url.pathname.startsWith(href);
	const q = $derived(page.url.pathname === '/shop/cari' ? (page.url.searchParams.get('q') ?? '') : '');

	/** Tautan cadangan tanpa JavaScript; dengan JavaScript bahasa diganti tanpa memuat ulang halaman */
	const langHref = (l: Lang) =>
		`/shop/bahasa?lang=${l}&to=${encodeURIComponent(page.url.pathname + page.url.search)}`;
	function switchLang(e: MouseEvent, l: Lang) {
		e.preventDefault();
		if (l !== lang()) setLang(l);
	}

	const iconBtn =
		'relative grid size-11 shrink-0 place-items-center rounded-full text-ink transition-colors hover:bg-muted hover:text-brand focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:outline-none';
</script>

{#snippet langSwitch(where: 'lang' | 'sheet')}
	<div class="flex rounded-full bg-muted p-1 font-ui text-[13px] font-bold" role="group" aria-label={t('nav.language')}>
		{#each LANGS as l (l)}
			<a
				href={langHref(l)}
				hreflang={l}
				lang={l}
				aria-current={lang() === l ? 'true' : undefined}
				onclick={(e) => switchLang(e, l)}
				data-sveltekit-reload
				data-testid={where === 'lang' ? `lang-${l}` : `sheet-lang-${l}`}
				class={cn(
					'grid h-8 min-w-10 place-items-center rounded-full px-2.5 uppercase transition-colors',
					lang() === l ? 'bg-white text-ink shadow-sm' : 'text-muted-foreground hover:text-ink'
				)}
			>
				{l}
			</a>
		{/each}
	</div>
{/snippet}

<!-- Header putih menempel di atas: logo, kotak cari, bahasa, keranjang. Di HP kotak cari turun ke baris kedua -->
<header class="sticky top-0 z-40 border-b bg-white">
	<div
		class="mx-auto flex max-w-7xl flex-wrap items-center gap-x-1 px-2 pb-2.5 sm:gap-x-2 sm:px-4 md:h-18 md:flex-nowrap md:gap-x-6 md:pb-0"
	>
		<div class="flex h-14 min-w-0 items-center gap-1 sm:gap-2 md:h-auto">
			<button type="button" class={cn(iconBtn, 'lg:hidden')} aria-label={t('nav.openMenu')} onclick={() => (menuOpen = true)}>
				<Menu class="size-6" />
			</button>
			<a
				href="/shop"
				class="min-w-0 shrink rounded-md focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:outline-none"
				aria-label={t('nav.home')}
			>
				<ShopLogo />
			</a>
		</div>

		<form
			action="/shop/cari"
			method="GET"
			role="search"
			class="order-last mx-2 flex h-11 w-full items-center gap-2 rounded-full border border-input bg-white pr-1 pl-4 transition focus-within:border-brand focus-within:ring-3 focus-within:ring-brand/15 md:order-0 md:mx-auto md:h-12 md:max-w-2xl md:flex-1 md:pl-5"
		>
			<Search class="size-5 shrink-0 text-muted-foreground" />
			<input
				type="search"
				name="q"
				value={q}
				placeholder={t('nav.searchPlaceholder')}
				aria-label={t('nav.search')}
				class="h-full min-w-0 flex-1 bg-transparent font-ui text-base outline-none placeholder:text-muted-foreground"
			/>
			<button
				class="h-9 shrink-0 rounded-full bg-brand px-4 font-ui text-sm font-bold text-white transition-colors hover:bg-brand-strong md:h-10 md:px-6"
			>
				{t('nav.searchButton')}
			</button>
		</form>

		<div class="ml-auto flex items-center gap-1 md:ml-0">
			<div class="mr-1 hidden sm:block">
				{@render langSwitch('lang')}
			</div>
			<button type="button" class={iconBtn} aria-label={t('nav.cart', { n: cartCount })} onclick={onOpenCart} data-testid="open-cart">
				<ShoppingCart class="size-6" />
				{#if cartCount > 0}
					<span
						class="absolute top-0.5 right-0 grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[11px] font-bold text-white ring-2 ring-white"
						data-testid="cart-count">{cartCount}</span
					>
				{/if}
			</button>
		</div>
	</div>
</header>

<!-- Menu HP & tablet -->
<Sheet.Root bind:open={menuOpen}>
	<Sheet.Content side="left" class="w-[86vw] max-w-sm gap-0 p-0">
		<Sheet.Header class="border-b px-5 py-4">
			<Sheet.Title class="sr-only">{t('nav.menu')}</Sheet.Title>
			<a href="/shop" onclick={() => (menuOpen = false)}><ShopLogo /></a>
			<div class="mt-3 flex items-center gap-2 text-sm">
				<span class="text-muted-foreground">{t('nav.language')}</span>
				{@render langSwitch('sheet')}
			</div>
		</Sheet.Header>
		<nav aria-label={t('nav.menu')} class="flex-1 overflow-y-auto py-2">
			{#each nav as item (item.href)}
				<a
					href={item.href}
					onclick={() => (menuOpen = false)}
					class={cn(
						'flex items-center justify-between px-5 py-3.5 font-ui text-lg font-bold',
						isActive(item.href) ? 'text-brand' : 'hover:bg-muted'
					)}
				>
					{item.label}
					<ChevronRight class="size-5 text-muted-foreground" />
				</a>
			{/each}
			<div class="mt-2 border-t px-5 pt-4 text-sm">
				<a href="/shop/cek-pesanan" onclick={() => (menuOpen = false)} class="flex items-center gap-2 py-2 font-medium">
					<PackageSearch class="size-4" />
					{t('nav.checkOrder')}
				</a>
				<a href="/shop/info/cara-kerja-po" onclick={() => (menuOpen = false)} class="block py-2 font-medium">{t('nav.howItWorks')}</a>
				<a href="/shop/info/faq" onclick={() => (menuOpen = false)} class="block py-2 font-medium">{t('nav.faq')}</a>
				<a href="/shop/info/kebijakan-refund" onclick={() => (menuOpen = false)} class="block py-2 font-medium">{t('nav.refundPolicy')}</a>
				<a href="/" data-sveltekit-reload class="block py-2 text-muted-foreground">{t('nav.customUniform')}</a>
			</div>
		</nav>
	</Sheet.Content>
</Sheet.Root>
