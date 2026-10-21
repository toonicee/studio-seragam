<script lang="ts">
	import { Progress } from '$lib/components/ui/progress';
	import { timeLeftLabel } from '$lib/shop/i18n';
	import { lang, t } from '$lib/shop/i18n.svelte';
	import { poPhase, progress } from '$lib/shop/po';
	import type { BatchView } from '$lib/shop/types';
	import { cn } from '$lib/utils';

	let {
		batch,
		now,
		size = 'sm',
		class: className = ''
	}: { batch: BatchView | null; now: number; size?: 'sm' | 'lg'; class?: string } = $props();

	const phase = $derived(poPhase(batch, now));
	const p = $derived(batch ? progress(batch.collected, batch.target) : null);
	const status = $derived.by(() => {
		if (!batch) return '';
		switch (phase) {
			case 'open':
			case 'closing':
			case 'reached':
				return timeLeftLabel(lang(), batch.closesAt, now);
			case 'closed':
				return t('progress.tallying');
			case 'production':
				return t('progress.production');
			case 'done':
				return t('progress.done');
			case 'failed':
				return t('progress.failed');
			default:
				return '';
		}
	});
</script>

{#if batch && p}
	<div class={cn('w-full', className)}>
		<div class={cn('flex items-baseline justify-between gap-2', size === 'lg' ? 'text-sm' : 'text-xs')}>
			<span class="text-muted-foreground">
				<b class="font-semibold text-foreground tabular-nums">{batch.collected}</b>/{batch.target} pcs
			</span>
			<span
				class={cn(
					'font-medium',
					phase === 'closing' ? 'text-warning' : phase === 'reached' ? 'text-success' : 'text-muted-foreground'
				)}
			>
				{status}
			</span>
		</div>
		<Progress
			value={p.pct}
			max={100}
			aria-label={t('progress.aria', { n: batch.collected, target: batch.target })}
			class={cn(
				'mt-1.5',
				size === 'lg' ? 'h-2.5' : 'h-1.5',
				p.reached
					? '[&>[data-slot=progress-indicator]]:bg-success'
					: phase === 'failed'
						? '[&>[data-slot=progress-indicator]]:bg-destructive/60'
						: '[&>[data-slot=progress-indicator]]:bg-brand'
			)}
		/>
	</div>
{/if}
