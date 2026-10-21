<script lang="ts">
	import { Progress } from '$lib/components/ui/progress';
	import { poPhase, progress, timeLeft } from '$lib/shop/po';
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
				return timeLeft(batch.closesAt, now).label;
			case 'closed':
				return 'Menunggu rekap';
			case 'production':
				return 'Diproduksi';
			case 'done':
				return 'Selesai';
			case 'failed':
				return 'Tidak tercapai';
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
			aria-label="Progres PO {batch.collected} dari {batch.target} pcs"
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
