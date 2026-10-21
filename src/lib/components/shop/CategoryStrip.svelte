<script lang="ts">
	import { page } from '$app/state';
	import { t } from '$lib/shop/i18n.svelte';
	import type { CategoryView } from '$lib/shop/types';
	import { cn } from '$lib/utils';
	import CategoryIcon, { categoryIcon, type CategoryIconName } from './CategoryIcon.svelte';

	/** Menu kategori di bawah header (semua halaman toko): ikon + nama. HP & tablet: baris geser, layar lebar: satu baris rata */
	let { categories }: { categories: CategoryView[] } = $props();

	const items = $derived<{ href: string; label: string; icon: CategoryIconName }[]>([
		{ href: '/shop/katalog', label: t('common.allProducts'), icon: 'all' },
		...categories.map((c) => ({ href: `/shop/katalog/${c.slug}`, label: c.name, icon: categoryIcon(c.slug) }))
	]);

	const isActive = (href: string) =>
		href === '/shop/katalog' ? page.url.pathname === href : page.url.pathname.startsWith(href);
</script>

<nav aria-label={t('nav.categories')} class="border-b bg-white">
	<ul
		class="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-2.5 scrollbar-none lg:justify-between lg:gap-4 lg:overflow-visible lg:py-0 [&::-webkit-scrollbar]:hidden"
	>
		{#each items as it (it.href)}
			<li class="flex shrink-0">
				<!-- Aktif: HP = chip oranye, layar lebar = teks oranye + garis bawah -->
				<a
					href={it.href}
					aria-current={isActive(it.href) ? 'page' : undefined}
					class={cn(
						'group relative flex items-center gap-2 rounded-full border px-3 py-1.5 font-ui text-sm font-semibold whitespace-nowrap text-ink transition-colors hover:border-brand/40 hover:text-brand',
						'lg:rounded-none lg:border-0 lg:px-1 lg:py-3.5 lg:text-[15px]',
						'lg:after:absolute lg:after:inset-x-1 lg:after:bottom-0 lg:after:h-0.75 lg:after:rounded-t-full lg:after:bg-brand lg:after:opacity-0 lg:after:transition-opacity',
						isActive(it.href) && 'border-brand bg-brand-soft text-brand lg:bg-transparent lg:after:opacity-100'
					)}
				>
					<CategoryIcon name={it.icon} class="size-6 shrink-0 transition-transform group-hover:-translate-y-0.5 lg:size-8" />
					{it.label}
				</a>
			</li>
		{/each}
	</ul>
</nav>
