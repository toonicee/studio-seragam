<script lang="ts">
	import QrCode from '@lucide/svelte/icons/qr-code';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import Truck from '@lucide/svelte/icons/truck';
	import BadgeCheck from '@lucide/svelte/icons/badge-check';
	import { t } from '$lib/shop/i18n.svelte';

	const items = $derived([
		{ icon: QrCode, title: t('usp.qris'), text: t('usp.qrisText') },
		{ icon: ShieldCheck, title: t('usp.refund'), text: t('usp.refundText') },
		{ icon: Truck, title: t('usp.ship'), text: t('usp.shipText') },
		{ icon: BadgeCheck, title: t('usp.partner'), text: t('usp.partnerText') }
	]);
</script>

<ul class="grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border lg:grid-cols-4">
	{#each items as it (it.title)}
		<li class="flex items-center gap-3 bg-white p-4 md:p-5">
			<span class="grid size-10 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
				<it.icon class="size-5" />
			</span>
			<span class="min-w-0">
				<span class="block text-sm leading-tight font-semibold">{it.title}</span>
				<span class="block text-xs leading-snug text-muted-foreground">{it.text}</span>
			</span>
		</li>
	{/each}
</ul>
