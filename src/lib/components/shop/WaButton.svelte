<script lang="ts">
	import WhatsAppIcon from './WhatsAppIcon.svelte';
	import { t } from '$lib/shop/i18n.svelte';
	import { waLink } from '$lib/shop/wa';
	import { cn } from '$lib/utils';

	let {
		phone,
		text,
		label,
		size = 'md',
		class: className = ''
	}: { phone: string; text: string; label?: string; size?: 'sm' | 'md'; class?: string } = $props();
	const text_ = $derived(label ?? t('common.chatAdmin'));
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
	<WhatsAppIcon class={size === 'sm' ? 'size-3.5' : 'size-4'} />
	{text_}
</a>
