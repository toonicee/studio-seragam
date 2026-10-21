<script lang="ts">
	import CalendarClock from '@lucide/svelte/icons/calendar-clock';
	import Truck from '@lucide/svelte/icons/truck';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import Info from '@lucide/svelte/icons/info';
	import { fmtDay, fmtDeadline } from '$lib/shop/format';
	import type { TKey } from '$lib/shop/i18n';
	import { lang, t } from '$lib/shop/i18n.svelte';
	import { PHASE_META, poPhase, progress, shipEstimate } from '$lib/shop/po';
	import type { BatchView } from '$lib/shop/types';
	import PoBadge from './PoBadge.svelte';
	import PoProgress from './PoProgress.svelte';

	let { batch, now }: { batch: BatchView | null; now: number } = $props();

	const phase = $derived(poPhase(batch, now));
	const meta = $derived(PHASE_META[phase]);
	const p = $derived(batch ? progress(batch.collected, batch.target) : null);
</script>

<section aria-label={t('po.section')} class="rounded-lg border bg-white shadow-[0_1px_0_rgba(0,0,0,0.02)]">
	<div class="flex items-center justify-between gap-3 border-b px-5 py-3.5">
		<PoBadge {phase} />
		{#if batch}
			<span class="text-xs font-semibold tracking-wider text-muted-foreground uppercase">{t('po.batch', { n: batch.batchNo })}</span>
		{/if}
	</div>
	<div class="px-5 py-4">
		{#if batch && p}
			{#if phase === 'reached'}
				<p class="mb-3 font-semibold text-success">{t('po.reachedSure')}</p>
			{:else if meta.orderable}
				<p class="mb-3 text-sm">{t('po.remaining', { n: p.remaining })}</p>
			{/if}
			<PoProgress {batch} {now} size="lg" />
			<dl class="mt-4 grid gap-2.5 text-sm">
				<div class="flex items-start gap-2.5">
					<CalendarClock class="mt-0.5 size-4 shrink-0 text-brand" />
					<dt class="w-32 shrink-0 text-muted-foreground">{meta.orderable ? t('po.closes') : t('po.closed')}</dt>
					<dd class="font-medium">{fmtDeadline(batch.closesAt, lang())}</dd>
				</div>
				<div class="flex items-start gap-2.5">
					<Truck class="mt-0.5 size-4 shrink-0 text-brand" />
					<dt class="w-32 shrink-0 text-muted-foreground">{t('po.eta')}</dt>
					<dd class="font-medium">
						{phase === 'failed' ? '—' : fmtDay(shipEstimate(batch.closesAt, batch.productionDays), lang())}
					</dd>
				</div>
				<div class="flex items-start gap-2.5">
					<ShieldCheck class="mt-0.5 size-4 shrink-0 text-brand" />
					<dd>{t('po.guarantee')}</dd>
				</div>
			</dl>
		{/if}
		{#if meta.hasReason}
			<p class="mt-4 flex items-start gap-2 rounded-md bg-muted px-3 py-2.5 text-sm text-muted-foreground">
				<Info class="mt-0.5 size-4 shrink-0" />
				{t(`reason.${phase}` as TKey)}
			</p>
		{/if}
	</div>
</section>
