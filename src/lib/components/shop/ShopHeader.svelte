<script lang="ts">
	import { page } from '$app/state';
	import * as Sheet from '$lib/components/ui/sheet';
	import Menu from '@lucide/svelte/icons/menu';
	import Search from '@lucide/svelte/icons/search';
	import ShoppingBag from '@lucide/svelte/icons/shopping-bag';
	import PackageSearch from '@lucide/svelte/icons/package-search';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import X from '@lucide/svelte/icons/x';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
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
		{ href: '/shop/katalog', label: 'Semua Produk' },
		...categories.map((c) => ({ href: `/shop/katalog/${c.slug}`, label: c.name })),
		{ href: '/shop/info/cara-kerja-po', label: 'Cara Kerja PO' }
	]);

	const isActive = (href: string) =>
		href === '/shop/katalog' ? page.url.pathname === href : page.url.pathname.startsWith(href);
	const q = $derived(page.url.pathname === '/shop/cari' ? (page.url.searchParams.get('q') ?? '') : '');
</script>

<!-- Bar info PO -->
<div class="bg-brand text-white">
	<div class="mx-auto flex h-9 max-w-7xl items-center justify-center gap-6 px-4 text-xs font-medium md:justify-between">
		<p class="flex items-center gap-1.5 truncate">
			<ShieldCheck class="size-3.5 shrink-0" />
			<span class="truncate md:hidden">Pre-order · Dana kembali 100% jika target gagal</span>
			<span class="hidden truncate md:inline">Sistem pre-order · Dana kembali 100% jika target tidak tercapai</span>
		</p>
		<div class="hidden items-center gap-5 md:flex">
			<span>Khusus mitra Indah Expres</span>
			<a href="/shop/cek-pesanan" class="underline-offset-4 hover:underline">Cek pesanan</a>
			<a href="/shop/info/faq" class="underline-offset-4 hover:underline">Bantuan</a>
		</div>
	</div>
</div>

<header class="sticky top-0 z-40 border-b bg-white">
	<div class="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 md:h-[76px] md:gap-6">
		<button
			type="button"
			class="-ml-2 grid size-10 place-items-center rounded-md hover:bg-muted lg:hidden"
			aria-label="Buka menu"
			onclick={() => (menuOpen = true)}
		>
			<Menu class="size-6" />
		</button>

		<a href="/shop" class="shrink-0" aria-label="Toko Indah Expres — beranda">
			<ShopLogo />
		</a>

		<form action="/shop/cari" method="GET" role="search" class="relative ml-auto hidden max-w-md flex-1 md:block">
			<Search class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
			<input
				type="search"
				name="q"
				value={q}
				placeholder="Cari kaos, kemeja, topi…"
				aria-label="Cari produk"
				class="h-11 w-full rounded-md border border-input bg-muted/40 pr-3 pl-9 text-sm outline-none placeholder:text-muted-foreground focus:border-brand focus:bg-white focus:ring-3 focus:ring-brand/15"
			/>
		</form>

		<div class="ml-auto flex items-center gap-1 md:ml-0">
			<button
				type="button"
				class="grid size-10 place-items-center rounded-md hover:bg-muted md:hidden"
				aria-label="Cari produk"
				aria-expanded={searchOpen}
				onclick={() => (searchOpen = !searchOpen)}
			>
				{#if searchOpen}<X class="size-5" />{:else}<Search class="size-5" />{/if}
			</button>
			<a
				href="/shop/cek-pesanan"
				class="hidden h-10 items-center gap-2 rounded-md px-3 text-sm font-medium hover:bg-muted lg:flex"
			>
				<PackageSearch class="size-5" />
				Cek pesanan
			</a>
			<button
				type="button"
				class="relative flex h-10 items-center gap-2 rounded-md px-2.5 text-sm font-semibold hover:bg-muted"
				aria-label="Keranjang, {cartCount} barang"
				onclick={onOpenCart}
				data-testid="open-cart"
			>
				<span class="relative">
					<ShoppingBag class="size-6" />
					{#if cartCount > 0}
						<span
							class="absolute -top-2 -right-2.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[11px] font-bold text-white ring-2 ring-white"
							data-testid="cart-count">{cartCount}</span
						>
					{/if}
				</span>
				<span class="hidden lg:inline">Keranjang</span>
			</button>
		</div>
	</div>

	{#if searchOpen}
		<form action="/shop/cari" method="GET" role="search" class="border-t px-4 py-3 md:hidden">
			<!-- svelte-ignore a11y_autofocus -->
			<input
				type="search"
				name="q"
				value={q}
				autofocus
				placeholder="Cari kaos, kemeja, topi…"
				aria-label="Cari produk"
				class="h-11 w-full rounded-md border border-input px-3 text-base outline-none focus:border-brand focus:ring-3 focus:ring-brand/15"
			/>
		</form>
	{/if}

	<!-- Menu kategori (desktop), gaya fanshop: datar, huruf besar -->
	<nav aria-label="Kategori" class="hidden border-t lg:block">
		<ul class="mx-auto flex max-w-7xl items-center gap-1 px-4">
			{#each nav as item (item.href)}
				<li>
					<a
						href={item.href}
						aria-current={isActive(item.href) ? 'page' : undefined}
						class={cn(
							'relative block px-3 py-3 font-display text-[17px] font-semibold tracking-wide uppercase transition-colors hover:text-brand',
							isActive(item.href) &&
								'text-brand after:absolute after:inset-x-3 after:bottom-0 after:h-[3px] after:rounded-t after:bg-brand'
						)}
					>
						{item.label}
					</a>
				</li>
			{/each}
			<li class="ml-auto">
				<a
					href="/"
					data-sveltekit-reload
					class="block px-3 py-3 text-sm font-medium text-muted-foreground hover:text-brand"
				>
					Desain seragam kustom →
				</a>
			</li>
		</ul>
	</nav>
</header>

<!-- Menu HP -->
<Sheet.Root bind:open={menuOpen}>
	<Sheet.Content side="left" class="w-[86vw] max-w-sm gap-0 p-0">
		<Sheet.Header class="border-b px-5 py-4">
			<Sheet.Title class="sr-only">Menu toko</Sheet.Title>
			<a href="/shop" onclick={() => (menuOpen = false)}><ShopLogo /></a>
		</Sheet.Header>
		<nav aria-label="Menu" class="flex-1 overflow-y-auto py-2">
			{#each nav as item (item.href)}
				<a
					href={item.href}
					onclick={() => (menuOpen = false)}
					class={cn(
						'flex items-center justify-between px-5 py-3.5 font-display text-xl font-semibold tracking-wide uppercase',
						isActive(item.href) ? 'text-brand' : 'hover:bg-muted'
					)}
				>
					{item.label}
					<ChevronRight class="size-5 text-muted-foreground" />
				</a>
			{/each}
			<div class="mt-2 border-t px-5 pt-4 text-sm">
				<a href="/shop/cek-pesanan" onclick={() => (menuOpen = false)} class="flex items-center gap-2 py-2 font-medium">
					<PackageSearch class="size-4" /> Cek pesanan
				</a>
				<a href="/shop/info/faq" onclick={() => (menuOpen = false)} class="block py-2 font-medium">FAQ</a>
				<a href="/shop/info/kebijakan-refund" onclick={() => (menuOpen = false)} class="block py-2 font-medium">
					Kebijakan refund
				</a>
				<a href="/" data-sveltekit-reload class="block py-2 text-muted-foreground">Desain seragam kustom →</a>
			</div>
		</nav>
	</Sheet.Content>
</Sheet.Root>
