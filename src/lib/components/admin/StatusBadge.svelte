<script lang="ts">
	import type { OrderStatus, RefundStatus } from '$lib/shop/constants';
	import { ORDER_STATUS_META, REFUND_STATUS_META, TONE_CLASS } from '$lib/shop/status';
	import { cn } from '$lib/utils';

	let { order, refund }: { order?: OrderStatus; refund?: RefundStatus } = $props();
	const meta = $derived(order ? ORDER_STATUS_META[order] : refund ? REFUND_STATUS_META[refund] : null);
</script>

{#if meta}
	<span class={cn('inline-flex rounded-[3px] px-2 py-0.5 text-[11px] font-bold tracking-wide whitespace-nowrap uppercase', TONE_CLASS[meta.tone])}>
		{meta.label}
	</span>
{/if}
