<script lang="ts">
	import { CLIENT_CONFIG } from '$lib/client-config';
	import { cn } from '$lib/utils';

	let { inverse = false, class: className = '' }: { inverse?: boolean; class?: string } = $props();
</script>

<span class={cn('flex items-center gap-2.5', className)}>
	<img src={CLIENT_CONFIG.markUrl} alt="" width="40" height="40" class="size-9 md:size-10" />
	<span class="flex flex-col leading-none">
		<span class={cn('font-display text-[22px] font-bold tracking-wide md:text-[25px]', inverse ? 'text-white' : 'text-ink')}>
			INDAH EXPRES
		</span>
		<span class={cn('mt-0.5 text-[10px] font-semibold tracking-[0.28em] uppercase', inverse ? 'text-white/60' : 'text-brand')}>
			Merchandise
		</span>
	</span>
</span>
