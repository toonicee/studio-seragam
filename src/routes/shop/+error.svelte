<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import ShopLogo from '$lib/components/shop/ShopLogo.svelte';
	import { t } from '$lib/shop/i18n.svelte';

	const heading = $derived(page.status === 404 ? t('error.404') : t('error.other'));
</script>

<svelte:head>
	<title>{heading} — {t('meta.suffix')}</title>
</svelte:head>

<main class="grid min-h-dvh place-content-center justify-items-center gap-4 px-6 text-center">
	<a href="/shop"><ShopLogo /></a>
	<p class="display mt-6 text-7xl text-brand">{page.status}</p>
	<h1 class="text-xl font-semibold">{heading}</h1>
	<p class="max-w-sm text-muted-foreground">{page.error?.message}</p>
	<Button href="/shop" class="mt-2">{t('common.backToShop')}</Button>
</main>
