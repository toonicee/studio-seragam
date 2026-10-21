<script lang="ts">
	import CalendarClock from '@lucide/svelte/icons/calendar-clock';
	import Truck from '@lucide/svelte/icons/truck';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import Info from '@lucide/svelte/icons/info';
	import { fmtDay, fmtDeadline } from '$lib/shop/format';
	import { PHASE_META, poPhase, progress, shipEstimate } from '$lib/shop/po';
	import type { BatchView } from '$lib/shop/types';
	import PoBadge from './PoBadge.svelte';
	import PoProgress from './PoProgress.svelte';

	let { batch, now }: { batch: BatchView | null; now: number } = $props();

	const phase = $derived(poPhase(batch, now));
	const meta = $derived(PHASE_META[phase]);
	const p = $derived(batch ? progress(batch.collected, batch.target) : null);
</script>

<section aria-label="Info pre-order" class="rounded-lg border bg-white shadow-[0_1px_0_rgba(0,0,0,0.02)]">
	<div class="flex items-center justify-between gap-3 border-b px-5 py-3.5">
		<PoBadge {phase} />
		{#if batch}
			<span class="text-xs font-semibold tracking-wider text-muted-foreground uppercase">PO batch {batch.batchNo}</span>
		{/if}
	</div>
	<div class="px-5 py-4">
		{#if batch && p}
			{#if phase === 'reached'}
				<p class="mb-3 font-semibold text-success">Target tercapai — pasti diproduksi</p>
			{:else if meta.orderable}
				<p class="mb-3 text-sm">
					<b>{p.remaining} pcs lagi</b> untuk mencapai target. Pesanan dihitung setelah pembayaran dikonfirmasi.
				</p>
			{/if}
			<PoProgress {batch} {now} size="lg" />
			<dl class="mt-4 grid gap-2.5 text-sm">
				<div class="flex items-start gap-2.5">
					<CalendarClock class="mt-0.5 size-4 shrink-0 text-brand" />
					<dt class="w-28 shrink-0 text-muted-foreground">{meta.orderable ? 'PO ditutup' : 'Ditutup'}</dt>
					<dd class="font-medium">{fmtDeadline(batch.closesAt)}</dd>
				</div>
				<div class="flex items-start gap-2.5">
					<Truck class="mt-0.5 size-4 shrink-0 text-brand" />
					<dt class="w-28 shrink-0 text-muted-foreground">Estimasi kirim</dt>
					<dd class="font-medium">
						{phase === 'failed' ? '—' : fmtDay(shipEstimate(batch.closesAt, batch.productionDays))}
					</dd>
				</div>
				<div class="flex items-start gap-2.5">
					<ShieldCheck class="mt-0.5 size-4 shrink-0 text-brand" />
					<dt class="sr-only">Jaminan</dt>
					<dd>Dana kembali <b>100%</b> jika target tidak tercapai.</dd>
				</div>
			</dl>
		{/if}
		{#if meta.reason}
			<p class="mt-4 flex items-start gap-2 rounded-md bg-muted px-3 py-2.5 text-sm text-muted-foreground">
				<Info class="mt-0.5 size-4 shrink-0" />
				{meta.reason}
			</p>
		{/if}
	</div>
</section>
