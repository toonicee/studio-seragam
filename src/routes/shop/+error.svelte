<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import ShopLogo from '$lib/components/shop/ShopLogo.svelte';
</script>

<svelte:head>
	<title>{page.status === 404 ? 'Halaman tidak ditemukan' : 'Terjadi kesalahan'} — Toko Indah Expres</title>
</svelte:head>

<main class="grid min-h-dvh place-content-center justify-items-center gap-4 px-6 text-center">
	<a href="/shop"><ShopLogo /></a>
	<p class="display mt-6 text-7xl text-brand">{page.status}</p>
	<h1 class="text-xl font-semibold">
		{page.status === 404 ? 'Halaman tidak ditemukan' : 'Terjadi kesalahan'}
	</h1>
	<p class="max-w-sm text-muted-foreground">{page.error?.message}</p>
	<Button href="/shop" class="mt-2">Kembali ke toko</Button>
</main>
