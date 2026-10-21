<script lang="ts">
	import MessageCircle from '@lucide/svelte/icons/message-circle';
	import { waLink } from '$lib/shop/wa';
	import { cn } from '$lib/utils';

	let {
		phone,
		text,
		label = 'Chat admin via WhatsApp',
		size = 'md',
		class: className = ''
	}: { phone: string; text: string; label?: string; size?: 'sm' | 'md'; class?: string } = $props();
</script>

<a
	href={waLink(phone, text)}
	target="_blank"
	rel="noopener noreferrer"
	class={cn(
		'inline-flex items-center justify-center gap-2 rounded-md bg-[#1fae5b] font-semibold text-white transition-colors hover:bg-[#178f4a] focus-visible:ring-3 focus-visible:ring-[#1fae5b]/30 focus-visible:outline-none',
		size === 'sm' ? 'h-8 px-3 text-xs' : 'h-11 px-4 text-sm',
		className
	)}
>
	<MessageCircle class={size === 'sm' ? 'size-3.5' : 'size-4'} />
	{label}
</a>
