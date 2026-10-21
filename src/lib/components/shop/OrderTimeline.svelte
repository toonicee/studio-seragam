<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import { fmtDay, fmtDateTime } from '$lib/shop/format';
	import { shipEstimate } from '$lib/shop/po';
	import type { OrderView } from '$lib/shop/types';
	import { cn } from '$lib/utils';

	let { order }: { order: OrderView } = $props();

	const active = $derived(order.items.filter((i) => !i.refunded));
	const lastClose = $derived(Math.max(0, ...active.map((i) => i.batch.closesAt)));
	const allClosed = $derived(active.length > 0 && active.every((i) => i.batch.status !== 'open'));
	const allProduced = $derived(
		active.length > 0 && active.every((i) => i.batch.status === 'production' || i.batch.status === 'done')
	);
	const eta = $derived(Math.max(0, ...active.map((i) => shipEstimate(i.batch.closesAt, i.batch.productionDays))));

	const steps = $derived([
		{ label: 'Pesanan dibuat', done: true, note: fmtDateTime(order.createdAt) },
		{
			label: 'Pembayaran dikonfirmasi',
			done: !!order.paidAt,
			note: order.paidAt
				? fmtDateTime(order.paidAt)
				: order.status === 'pending_confirmation'
					? 'Bukti diterima, menunggu admin'
					: 'Menunggu pembayaran'
		},
		{
			label: 'PO ditutup',
			done: allClosed,
			note: lastClose ? (allClosed ? 'Target sudah direkap' : `Paling lambat ${fmtDay(lastClose)}`) : ''
		},
		{ label: 'Produksi', done: allProduced, note: allProduced ? 'Target tercapai, sedang dibuat' : 'Mulai setelah target tercapai' },
		{
			label: 'Dikirim',
			done: order.status === 'shipped',
			note: order.shippedAt ? `${fmtDateTime(order.shippedAt)} · resi ${order.trackingNo}` : eta ? `Estimasi ${fmtDay(eta)}` : ''
		}
	]);
	const current = $derived(steps.findIndex((s) => !s.done));
</script>

<ol class="relative grid gap-0">
	{#each steps as s, i (s.label)}
		<li class="relative flex gap-4 pb-6 last:pb-0">
			{#if i < steps.length - 1}
				<span class={cn('absolute top-8 bottom-0 left-[15px] w-0.5', s.done ? 'bg-success' : 'bg-border')}></span>
			{/if}
			<span
				class={cn(
					'relative z-10 grid size-8 shrink-0 place-items-center rounded-full border-2 text-sm font-bold',
					s.done ? 'border-success bg-success text-white' : i === current ? 'border-brand bg-white text-brand' : 'border-border bg-white text-muted-foreground'
				)}
			>
				{#if s.done}<Check class="size-4" />{:else}{i + 1}{/if}
			</span>
			<div class="pt-1">
				<p class={cn('font-semibold', !s.done && i !== current && 'text-muted-foreground')}>{s.label}</p>
				{#if s.note}<p class="text-sm text-muted-foreground">{s.note}</p>{/if}
			</div>
		</li>
	{/each}
</ol>
