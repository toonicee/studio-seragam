<script lang="ts">
	import { page } from '$app/state';
	import LayoutDashboard from '@lucide/svelte/icons/layout-dashboard';
	import BadgeCheck from '@lucide/svelte/icons/badge-check';
	import Receipt from '@lucide/svelte/icons/receipt';
	import Package from '@lucide/svelte/icons/package';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
	import Users from '@lucide/svelte/icons/users';
	import Settings from '@lucide/svelte/icons/settings';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import { cn } from '$lib/utils';

	let { counts, onNavigate }: { counts: { payments: number; refunds: number }; onNavigate?: () => void } = $props();

	const items = $derived([
		{ href: '/shop/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
		{ href: '/shop/admin/pembayaran', label: 'Konfirmasi bayar', icon: BadgeCheck, badge: counts.payments },
		{ href: '/shop/admin/pesanan', label: 'Pesanan', icon: Receipt },
		{ href: '/shop/admin/produk', label: 'Produk & PO', icon: Package, also: '/shop/admin/po' },
		{ href: '/shop/admin/refund', label: 'Refund', icon: RotateCcw, badge: counts.refunds },
		{ href: '/shop/admin/mitra', label: 'Mitra', icon: Users },
		{ href: '/shop/admin/pengaturan', label: 'Pengaturan', icon: Settings }
	]);

	const active = (it: { href: string; exact?: boolean; also?: string }) =>
		it.exact
			? page.url.pathname === it.href
			: page.url.pathname.startsWith(it.href) || (!!it.also && page.url.pathname.startsWith(it.also));
</script>

<nav class="grid gap-1" aria-label="Menu admin">
	{#each items as it (it.href)}
		<a
			href={it.href}
			onclick={onNavigate}
			aria-current={active(it) ? 'page' : undefined}
			class={cn(
				'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
				active(it) ? 'bg-white/10 text-white' : 'text-white/65 hover:bg-white/5 hover:text-white'
			)}
		>
			<it.icon class={cn('size-4.5', active(it) && 'text-brand')} />
			<span class="flex-1">{it.label}</span>
			{#if it.badge}
				<span class="grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1.5 text-[11px] font-bold text-white">{it.badge}</span>
			{/if}
		</a>
	{/each}
	<a href="/shop" target="_blank" class="mt-4 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-white/50 hover:text-white">
		<ExternalLink class="size-4" /> Lihat toko
	</a>
</nav>
