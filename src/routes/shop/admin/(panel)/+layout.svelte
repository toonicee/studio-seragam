<script lang="ts">
	import * as Sheet from '$lib/components/ui/sheet';
	import Menu from '@lucide/svelte/icons/menu';
	import LogOut from '@lucide/svelte/icons/log-out';
	import AdminNav from '$lib/components/admin/AdminNav.svelte';
	import ShopLogo from '$lib/components/shop/ShopLogo.svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
	let menuOpen = $state(false);
</script>

<svelte:head><meta name="robots" content="noindex" /></svelte:head>

<div class="min-h-dvh bg-surface lg:grid lg:grid-cols-[248px_1fr]">
	<aside class="sticky top-0 hidden h-dvh flex-col bg-ink p-4 lg:flex">
		<a href="/shop/admin" class="mb-6 block px-2 pt-2"><ShopLogo inverse /></a>
		<div class="flex-1 overflow-y-auto"><AdminNav counts={data.counts} /></div>
		<div class="border-t border-white/10 px-2 pt-4 text-xs text-white/60">
			<p class="truncate" title={data.user.email}>{data.user.email}</p>
			<form method="POST" action="/shop/admin/logout" class="mt-2">
				<button class="inline-flex items-center gap-2 text-white/70 hover:text-white"><LogOut class="size-4" /> Keluar</button>
			</form>
		</div>
	</aside>

	<div class="min-w-0">
		<header class="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-ink px-4 text-white lg:hidden">
			<button type="button" class="-ml-2 grid size-10 place-items-center" aria-label="Buka menu admin" onclick={() => (menuOpen = true)}>
				<Menu class="size-6" />
			</button>
			<a href="/shop/admin"><ShopLogo inverse /></a>
			<span class="w-8"></span>
		</header>
		<main class="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
			{@render children()}
		</main>
	</div>
</div>

<Sheet.Root bind:open={menuOpen}>
	<Sheet.Content side="left" class="w-72 border-0 bg-ink p-4 text-white">
		<Sheet.Header class="p-0 pb-4"><Sheet.Title class="sr-only">Menu admin</Sheet.Title><ShopLogo inverse /></Sheet.Header>
		<AdminNav counts={data.counts} onNavigate={() => (menuOpen = false)} />
		<form method="POST" action="/shop/admin/logout" class="mt-auto border-t border-white/10 pt-4 text-sm">
			<p class="truncate text-white/60">{data.user.email}</p>
			<button class="mt-2 inline-flex items-center gap-2 text-white/80"><LogOut class="size-4" /> Keluar</button>
		</form>
	</Sheet.Content>
</Sheet.Root>
