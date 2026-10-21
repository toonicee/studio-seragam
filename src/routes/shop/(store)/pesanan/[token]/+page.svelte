<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import * as Alert from '$lib/components/ui/alert';
	import Link2 from '@lucide/svelte/icons/link-2';
	import PartyPopper from '@lucide/svelte/icons/party-popper';
	import Hourglass from '@lucide/svelte/icons/hourglass';
	import Truck from '@lucide/svelte/icons/truck';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
	import PayPanel from '$lib/components/shop/PayPanel.svelte';
	import OrderTimeline from '$lib/components/shop/OrderTimeline.svelte';
	import PoBadge from '$lib/components/shop/PoBadge.svelte';
	import PoProgress from '$lib/components/shop/PoProgress.svelte';
	import WaButton from '$lib/components/shop/WaButton.svelte';
	import { fmtDateTime, fmtPhone, rupiah } from '$lib/shop/format';
	import { systemText } from '$lib/shop/i18n';
	import { lang, t } from '$lib/shop/i18n.svelte';
	import { poPhase } from '$lib/shop/po';
	import { ORDER_STATUS_META, REFUND_STATUS_META, TONE_CLASS } from '$lib/shop/status';
	import { waText } from '$lib/shop/wa';
	import { cn } from '$lib/utils';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const order = $derived(data.order);
	const meta = $derived(ORDER_STATUS_META[order.status]);
	const payable = $derived(order.status === 'pending_payment');

	async function copyLink() {
		try {
			await navigator.clipboard.writeText(data.statusUrl);
			toast.success(t('order.linkCopied'));
		} catch {
			toast.error(t('order.copyManual'));
		}
	}
</script>

<svelte:head>
	<title>{t('order.label')} {order.code} — {t('meta.suffix')}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="mx-auto max-w-5xl px-4 pt-8">
	{#if data.isNew}
		<Alert.Root class="mb-6 border-success/30 bg-success-soft">
			<PartyPopper class="text-success" />
			<Alert.Title>{t('order.newTitle')}</Alert.Title>
			<Alert.Description>{t('order.newText')}</Alert.Description>
		</Alert.Root>
	{/if}

	<header class="flex flex-col gap-4 border-b pb-6 md:flex-row md:items-end md:justify-between">
		<div>
			<p class="text-sm text-muted-foreground">{t('order.label')}</p>
			<h1 class="display text-[36px] md:text-[48px]" data-testid="order-code">{order.code}</h1>
			<div class="mt-2 flex flex-wrap items-center gap-2">
				<span class={cn('rounded-[3px] px-2 py-1 text-xs font-bold tracking-wide uppercase', TONE_CLASS[meta.tone])} data-testid="order-status">
					{t(`status.${order.status}`)}
				</span>
				<span class="text-sm text-muted-foreground">{t(`hint.${order.status}`)}</span>
			</div>
		</div>
		<div class="flex flex-wrap gap-2">
			<Button variant="outline" onclick={copyLink}><Link2 class="size-4" /> {t('order.copyLink')}</Button>
			<WaButton phone={data.waAdmin} text={waText.askAdmin(order, data.statusUrl)} label={t('common.askAdmin')} />
		</div>
	</header>

	<div class="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
		<div class="space-y-8">
			{#if payable}
				<PayPanel {order} qrisUrl={data.qrisUrl} merchantName={data.merchantName} now={data.now} />
			{:else if order.status === 'pending_confirmation'}
				<div class="flex gap-4 rounded-lg border border-brand/30 bg-brand-soft/50 p-5">
					<Hourglass class="mt-0.5 size-6 shrink-0 text-brand" />
					<div>
						<p class="font-semibold">{t('order.proofReceived', { at: order.proofAt ? fmtDateTime(order.proofAt, lang()) : '' })}</p>
						<p class="mt-1 text-sm text-ink-soft">{t('order.proofMatching', { amount: rupiah(order.total) })}</p>
						<a href="/shop/pesanan/{order.token}/bukti" target="_blank" class="mt-2 inline-block text-sm font-semibold text-brand hover:underline">{t('order.viewProof')}</a>
					</div>
				</div>
			{:else if order.status === 'shipped'}
				<div class="flex gap-4 rounded-lg border bg-success-soft p-5">
					<Truck class="mt-0.5 size-6 shrink-0 text-success" />
					<div>
						<p class="font-semibold">{t('order.shippedTitle')}</p>
						<p class="mt-1 text-sm">{t('order.tracking')} <b class="font-mono text-base" data-testid="tracking-no">{order.trackingNo}</b></p>
					</div>
				</div>
			{:else if order.status === 'cancelled'}
				<div class="rounded-lg border border-destructive/30 bg-destructive/5 p-5">
					<p class="font-semibold text-destructive">{t('order.cancelledTitle')}</p>
					<p class="mt-1 text-sm">{systemText(lang(), order.cancelReason)}</p>
				</div>
			{/if}

			{#if order.refunds.length}
				<section class="rounded-lg border p-5">
					<h2 class="flex items-center gap-2 font-display text-xl font-bold uppercase"><RotateCcw class="size-5 text-brand" /> {t('order.refunds')}</h2>
					<ul class="mt-3 divide-y">
						{#each order.refunds as r (r.id)}
							<li class="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
								<div>
									<p class="font-semibold">{rupiah(r.amount)}</p>
									<p class="text-muted-foreground">{t(`refund.${r.reason}`)}</p>
								</div>
								<span class={cn('rounded-[3px] px-2 py-1 text-xs font-bold uppercase', TONE_CLASS[REFUND_STATUS_META[r.status].tone])}>
									{t(`refund.${r.status}`)}
								</span>
							</li>
						{/each}
					</ul>
					{#if order.refunds.some((r) => r.status === 'pending')}
						<p class="mt-2 text-sm text-muted-foreground">{t('order.refundContact')}</p>
					{/if}
				</section>
			{/if}

			<section>
				<h2 class="font-display text-2xl font-bold uppercase">{t('order.items')}</h2>
				<ul class="mt-3 divide-y rounded-lg border">
					{#each order.items as item (item.id)}
						<li class="flex gap-4 p-4">
							{#if item.image}
								<img src={item.image.src} alt="" width="64" height="80" class="h-20 w-16 shrink-0 rounded bg-surface object-cover" style:object-position={item.image.src.endsWith('.jpg') ? 'center 15%' : 'center'} />
							{/if}
							<div class="min-w-0 flex-1">
								<div class="flex flex-wrap items-start justify-between gap-2">
									<div>
										<p class="font-semibold">{item.productName}</p>
										<p class="text-sm text-muted-foreground">
											{t('order.itemLine', { size: item.size ?? t('common.oneSize'), qty: item.qty, price: rupiah(item.unitPrice) })}
										</p>
									</div>
									{#if item.refunded}
										<span class="rounded-[3px] bg-muted px-2 py-1 text-[11px] font-bold text-muted-foreground uppercase">{t('order.refunded')}</span>
									{:else}
										<PoBadge phase={poPhase(item.batch, data.now)} />
									{/if}
								</div>
								{#if !item.refunded}
									<PoProgress batch={item.batch} now={data.now} class="mt-2 max-w-sm" />
								{/if}
							</div>
						</li>
					{/each}
				</ul>
			</section>
		</div>

		<aside class="space-y-6">
			<section class="rounded-lg border p-5">
				<h2 class="font-display text-xl font-bold uppercase">{t('order.status')}</h2>
				<div class="mt-4"><OrderTimeline {order} /></div>
			</section>
			<section class="rounded-lg border p-5 text-sm">
				<h2 class="font-display text-xl font-bold uppercase">{t('order.shipping')}</h2>
				<p class="mt-3 font-semibold">{order.customerName}</p>
				<p class="text-muted-foreground">{fmtPhone(order.phone)} · {t('order.partner', { code: order.partnerCode })}</p>
				<p class="mt-2">{order.address}, {order.city} {order.postalCode}</p>
				<p class="mt-2 text-muted-foreground">{order.shippingZone}</p>
				<dl class="mt-4 space-y-1 border-t pt-3">
					<div class="flex justify-between"><dt class="text-muted-foreground">{t('common.subtotal')}</dt><dd class="tabular-nums">{rupiah(order.subtotal)}</dd></div>
					<div class="flex justify-between"><dt class="text-muted-foreground">{t('common.shipping')}</dt><dd class="tabular-nums">{rupiah(order.shippingFee)}</dd></div>
					<div class="flex justify-between"><dt class="text-muted-foreground">{t('common.uniqueCode')}</dt><dd class="tabular-nums">{rupiah(order.uniqueCode)}</dd></div>
					<div class="flex justify-between font-semibold"><dt>{t('common.total')}</dt><dd class="tabular-nums">{rupiah(order.total)}</dd></div>
				</dl>
			</section>
		</aside>
	</div>
</div>
