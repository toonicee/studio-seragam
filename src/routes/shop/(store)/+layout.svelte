<script lang="ts">
	import type { LayoutProps } from './$types';
	import ShopHeader from '$lib/components/shop/ShopHeader.svelte';
	import TopBar from '$lib/components/shop/TopBar.svelte';
	import ShopFooter from '$lib/components/shop/ShopFooter.svelte';
	import CartSheet from '$lib/components/shop/CartSheet.svelte';
	import { cartUi } from '$lib/components/shop/cart-ui.svelte';
	import { t } from '$lib/shop/i18n.svelte';

	let { data, children }: LayoutProps = $props();
</script>

<div class="flex min-h-dvh flex-col">
	<a href="#isi" class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2">
		{t('a11y.skip')}
	</a>
	<TopBar waAdmin={data.waAdmin} />
	<ShopHeader categories={data.categories} cartCount={data.cart.count} onOpenCart={() => (cartUi.open = true)} />
	<main id="isi" class="flex-1">
		{@render children()}
	</main>
	<ShopFooter categories={data.categories} waAdmin={data.waAdmin} />
</div>

<CartSheet cart={data.cart} bind:open={cartUi.open} />
