<script lang="ts">
	import Truck from '@lucide/svelte/icons/truck';
	import BadgeCheck from '@lucide/svelte/icons/badge-check';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import { t } from '$lib/shop/i18n.svelte';
	import { waLink, waText } from '$lib/shop/wa';
	import WhatsAppIcon from './WhatsAppIcon.svelte';

	let { waAdmin }: { waAdmin: string } = $props();

	const items = $derived([
		{ icon: Truck, label: t('topbar.freeShipping') },
		{ icon: BadgeCheck, label: t('topbar.original') },
		{ icon: ShieldCheck, label: t('topbar.moneyBack') }
	]);
</script>

<!-- Bar keunggulan di atas menu (gaya topbar toko online), warna oranye tua agar beda dari header -->
<div class="bg-brand-strong text-white">
	<div class="mx-auto flex h-10 max-w-7xl items-stretch md:h-11">
		<!-- Desktop: semua keunggulan berjajar -->
		<ul class="hidden flex-1 items-center justify-center gap-10 md:flex">
			{#each items as it (it.label)}
				<li class="flex items-center gap-2 font-ui text-sm font-semibold">
					<it.icon class="size-5" strokeWidth={1.75} />
					{it.label}
				</li>
			{/each}
		</ul>
		<!-- HP: bergantian satu per satu -->
		<ul class="relative flex-1 md:hidden" aria-label={items.map((i) => i.label).join(' · ')}>
			{#each items as it, i (it.label)}
				<li class="ticker absolute inset-0 flex items-center justify-center gap-2 font-ui text-[13px] font-semibold" style:animation-delay="{i * 3}s">
					<it.icon class="size-4" strokeWidth={1.75} />
					{it.label}
				</li>
			{/each}
		</ul>
		<a
			href={waLink(waAdmin, waText.askAdmin())}
			target="_blank"
			rel="noopener noreferrer"
			aria-label={t('common.chatAdmin')}
			title={t('common.chatAdmin')}
			class="grid w-14 shrink-0 place-items-center border-l border-white/25 transition-colors hover:bg-black/10 md:w-16"
		>
			<WhatsAppIcon class="size-5 md:size-6" />
		</a>
	</div>
</div>

<style>
	.ticker {
		opacity: 0;
		animation: ticker 9s infinite;
	}

	@keyframes ticker {
		0% {
			opacity: 0;
			transform: translateY(6px);
		}
		4%,
		30% {
			opacity: 1;
			transform: none;
		}
		34%,
		100% {
			opacity: 0;
			transform: translateY(-6px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.ticker {
			animation: none;
		}
		.ticker:first-child {
			opacity: 1;
		}
	}
</style>
