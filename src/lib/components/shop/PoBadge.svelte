<script lang="ts">
	import { PHASE_META, type PoPhase } from '$lib/shop/po';
	import { TONE_CLASS } from '$lib/shop/status';
	import { cn } from '$lib/utils';

	let { phase, class: className = '' }: { phase: PoPhase; class?: string } = $props();
	const meta = $derived(PHASE_META[phase]);
</script>

<span
	class={cn(
		'inline-flex items-center rounded-[3px] px-2 py-1 text-[11px] leading-none font-bold tracking-wide uppercase',
		TONE_CLASS[meta.tone],
		className
	)}
>
	{meta.badge}
</span>
