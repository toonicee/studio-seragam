<script lang="ts">
	import { page } from '$app/state';
	import * as Sheet from '$lib/components/ui/sheet';
	import Menu from '@lucide/svelte/icons/menu';
	import Search from '@lucide/svelte/icons/search';
	import ShoppingCart from '@lucide/svelte/icons/shopping-cart';
	import PackageSearch from '@lucide/svelte/icons/package-search';
	import X from '@lucide/svelte/icons/x';
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
	let searchOpen = $state(false);

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
		'relative grid size-11 place-items-center rounded-full text-white transition-colors hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none';
</script>

{#snippet langSwitch(where: 'lang' | 'sheet')}
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
				'grid h-9 min-w-10 place-items-center rounded-full px-2.5 uppercase transition-colors',
				where === 'lang'
					? lang() === l
						? 'bg-black/20 text-white'
						: 'text-white/80 hover:text-white'
					: lang() === l
						? 'bg-white text-ink shadow-sm'
						: 'text-muted-foreground hover:text-foreground'
			)}
		>
			{l}
		</a>
	{/each}
{/snippet}

<!-- Header melayang gaya fanshop: satu bar warna brand, sudut membulat -->
<header class="sticky top-0 z-40 pt-3 md:pt-4">
	<!-- Lebar bar sejajar dengan isi halaman (max-w-7xl px-4) -->
	<div class="mx-auto max-w-7xl px-4">
		<div
			class="flex h-16 items-center gap-1 rounded-2xl bg-brand pr-1.5 pl-1.5 shadow-[0_10px_30px_-14px_rgba(23,32,42,0.55)] sm:gap-2 sm:pr-2 sm:pl-2 md:h-19 md:gap-4 md:pr-4 md:pl-4"
		>
			<button type="button" class={cn(iconBtn, 'xl:hidden')} aria-label={t('nav.openMenu')} onclick={() => (menuOpen = true)}>
				<Menu class="size-6" />
			</button>

			<a
				href="/shop"
				class="min-w-0 shrink rounded-lg bg-white px-2 py-1.5 shadow-sm ring-1 ring-black/5 sm:px-2.5 md:px-3"
				aria-label={t('nav.home')}
			>
				<ShopLogo />
			</a>

			<nav aria-label={t('nav.categories')} class="hidden flex-1 justify-center xl:flex">
				<ul class="flex items-center gap-1">
					{#each nav as item (item.href)}
						<li>
							<a
								href={item.href}
								aria-current={isActive(item.href) ? 'page' : undefined}
								class={cn(
									'block rounded-full px-3.5 py-2 font-ui text-[17px] font-bold whitespace-nowrap text-white transition-colors hover:bg-white/15',
									isActive(item.href) && 'bg-black/20'
								)}
							>
								{item.label}
							</a>
						</li>
					{/each}
				</ul>
			</nav>

			<div class="ml-auto flex items-center gap-1 xl:ml-0">
				<div class="mr-1 hidden items-center gap-0.5 font-ui text-sm font-bold sm:flex" role="group" aria-label={t('nav.language')}>
					{@render langSwitch('lang')}
				</div>
				<button type="button" class={iconBtn} aria-label={t('nav.cart', { n: cartCount })} onclick={onOpenCart} data-testid="open-cart">
					<ShoppingCart class="size-6" />
					{#if cartCount > 0}
						<span
							class="absolute top-0.5 right-0 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[11px] font-bold text-white ring-2 ring-brand"
							data-testid="cart-count">{cartCount}</span
						>
					{/if}
				</button>
				<button
					type="button"
					class={iconBtn}
					aria-label={t('nav.search')}
					aria-expanded={searchOpen}
					onclick={() => (searchOpen = !searchOpen)}
				>
					{#if searchOpen}<X class="size-6" />{:else}<Search class="size-6" />{/if}
				</button>
			</div>
		</div>

		{#if searchOpen}
			<form
				action="/shop/cari"
				method="GET"
				role="search"
				class="mt-2 flex items-center gap-2 rounded-2xl bg-white p-2 shadow-lg ring-1 ring-black/5"
				onsubmit={() => (searchOpen = false)}
			>
				<Search class="ml-2 size-5 shrink-0 text-muted-foreground" />
				<!-- svelte-ignore a11y_autofocus -->
				<input
					type="search"
					name="q"
					value={q}
					autofocus
					placeholder={t('nav.searchPlaceholder')}
					aria-label={t('nav.search')}
					class="h-11 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
				/>
				<button class="h-11 shrink-0 rounded-xl bg-ink px-5 text-sm font-semibold text-white hover:bg-ink-soft">{t('nav.searchButton')}</button>
			</form>
		{/if}
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
				<div class="flex rounded-full bg-muted p-1 font-ui font-bold" role="group" aria-label={t('nav.language')}>
					{@render langSwitch('sheet')}
				</div>
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
