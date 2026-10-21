<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import Minus from '@lucide/svelte/icons/minus';
	import Plus from '@lucide/svelte/icons/plus';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import ShoppingBag from '@lucide/svelte/icons/shopping-bag';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import PoProgress from '$lib/components/shop/PoProgress.svelte';
	import { cartAction } from '$lib/components/shop/cart-actions';
	import { fmtDeadline, rupiah } from '$lib/shop/format';
	import { cartProblemText } from '$lib/shop/i18n';
	import { lang, t, tn } from '$lib/shop/i18n.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const cart = $derived(data.cart);
</script>

<svelte:head><title>{t('cart.title')} — {t('meta.suffix')}</title></svelte:head>

<div class="mx-auto max-w-7xl px-4 pt-8">
	<h1 class="display text-[40px] md:text-[52px]">{t('cart.title')}</h1>

	{#if cart.lines.length}
		<div class="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
			<ul class="divide-y rounded-lg border">
				{#each cart.lines as line (line.key)}
					<li class="flex gap-4 p-4 md:p-5">
						<a href="/shop/produk/{line.slug}" class="shrink-0">
							{#if line.image}
								<img src={line.image.src} alt="" width="104" height="130" class="h-[130px] w-[104px] rounded-md bg-surface object-cover" style:object-position={line.image.src.endsWith('.jpg') ? 'center 15%' : 'center'} />
							{/if}
						</a>
						<div class="flex min-w-0 flex-1 flex-col gap-2">
							<div class="flex items-start justify-between gap-3">
								<div>
									<a href="/shop/produk/{line.slug}" class="font-semibold hover:text-brand">{line.name}</a>
									<p class="text-sm text-muted-foreground">{line.size ? t('common.sizeN', { size: line.size }) : t('common.oneSize')} · {t('cart.perPcs', { price: rupiah(line.price) })}</p>
								</div>
								<p class="font-semibold tabular-nums">{rupiah(line.lineTotal)}</p>
							</div>
							{#if line.problem}
								<p class="text-sm font-medium text-destructive">{cartProblemText(lang(), line.problem, line.batch?.closesAt)}</p>
							{:else if line.batch}
								<div class="max-w-xs">
									<PoProgress batch={line.batch} now={data.now} />
									<p class="mt-1 text-xs text-muted-foreground">{t('cart.closesFull', { deadline: fmtDeadline(line.batch.closesAt, lang()) })}</p>
								</div>
							{/if}
							<div class="mt-auto flex items-center gap-3 pt-1">
								<form method="POST" action="?/update" use:enhance={cartAction} class="flex items-center rounded-md border">
									<input type="hidden" name="key" value={line.key} />
									<button name="qty" value={line.qty - 1} class="grid size-9 place-items-center hover:bg-muted" aria-label={t('common.decrease')}><Minus class="size-4" /></button>
									<span class="w-9 text-center font-semibold tabular-nums">{line.qty}</span>
									<button name="qty" value={line.qty + 1} class="grid size-9 place-items-center hover:bg-muted" aria-label={t('common.increase')}><Plus class="size-4" /></button>
								</form>
								<form method="POST" action="?/remove" use:enhance={cartAction}>
									<input type="hidden" name="key" value={line.key} />
									<button class="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive"><Trash2 class="size-4" /> {t('cart.removeShort')}</button>
								</form>
							</div>
						</div>
					</li>
				{/each}
			</ul>

			<aside class="h-fit rounded-lg border bg-muted/30 p-5 lg:sticky lg:top-28">
				<h2 class="font-display text-2xl font-bold uppercase">{t('cart.summary')}</h2>
				<dl class="mt-4 space-y-2 text-sm">
					<div class="flex justify-between"><dt class="text-muted-foreground">{tn('cart.subtotalItems', cart.count)}</dt><dd class="font-semibold">{rupiah(cart.subtotal)}</dd></div>
					<div class="flex justify-between"><dt class="text-muted-foreground">{t('common.shipping')}</dt><dd>{t('cart.shippingLater')}</dd></div>
					<div class="flex justify-between"><dt class="text-muted-foreground">{t('common.uniqueCode')}</dt><dd>{t('cart.uniqueAuto')}</dd></div>
				</dl>
				<Button href={cart.ready ? '/shop/checkout' : undefined} disabled={!cart.ready} size="lg" class="mt-5 h-12 w-full text-base font-semibold">{t('cart.toCheckout')}</Button>
				{#if !cart.ready}<p class="mt-2 text-xs font-medium text-destructive">{t('cart.blockedShort')}</p>{/if}
				<p class="mt-4 flex gap-2 text-xs leading-relaxed text-muted-foreground">
					<ShieldCheck class="size-4 shrink-0 text-brand" />
					{t('cart.perPoNote')}
				</p>
			</aside>
		</div>
	{:else}
		<div class="mt-8 grid justify-items-center gap-3 rounded-lg border border-dashed py-20 text-center">
			<ShoppingBag class="size-12 text-muted-foreground/60" />
			<p class="text-lg font-semibold">{t('cart.emptyTitle')}</p>
			<p class="text-sm text-muted-foreground">{t('cart.emptyText')}</p>
			<Button href="/shop/katalog" class="mt-2">{t('cart.browse')}</Button>
		</div>
	{/if}
</div>
