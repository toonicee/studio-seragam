<script lang="ts" module>
	export type CategoryIconName = 'all' | 'shirt' | 'cap' | 'bag' | 'mug' | 'card' | 'tag';

	/** Kategori diatur lewat seed, jadi ikonnya ditebak dari slug; kategori baru yang tidak cocok memakai ikon label */
	const RULES: [RegExp, CategoryIconName][] = [
		[/e-?money|kartu|card|saldo/, 'card'],
		[/pakaian|kaos|kemeja|baju|polo|rompi|jaket/, 'shirt'],
		[/topi|aksesoris|cap/, 'cap'],
		[/tas|bag|pouch/, 'bag'],
		[/rumah|kantor|mug|tumbler|drink|minum/, 'mug']
	];

	export function categoryIcon(slug: string): CategoryIconName {
		return RULES.find(([re]) => re.test(slug))?.[1] ?? 'tag';
	}
</script>

<script lang="ts">
	let { name, class: className = '' }: { name: CategoryIconName; class?: string } = $props();

	// Warna tetap (ilustrasi): oranye brand, putih, dan garis tinta
	const INK = '#17202a';
	const BRAND = '#e35a12';
	const PEACH = '#ffd8c2';
	const GOLD = '#ffd27a';
</script>

<svg
	viewBox="0 0 48 48"
	class={className}
	aria-hidden="true"
	stroke={INK}
	stroke-width="2.25"
	stroke-linejoin="round"
	stroke-linecap="round"
>
	{#if name === 'all'}
		<rect x="6" y="6" width="16" height="16" rx="4" fill={BRAND} />
		<rect x="26" y="6" width="16" height="16" rx="4" fill="#fff" />
		<rect x="6" y="26" width="16" height="16" rx="4" fill="#fff" />
		<rect x="26" y="26" width="16" height="16" rx="4" fill={PEACH} />
	{:else if name === 'shirt'}
		<path d="M18 6 10 9.5 3 18l6 5 4-3.5V42h22V19.5l4 3.5 6-5-7-8.5L30 6c-1.5 2.5-3.5 4-6 4s-4.5-1.5-6-4Z" fill="#fff" />
		<path d="M3 18 9 23l1.7-1.5-6.2-5.3Z" fill={BRAND} />
		<path d="m45 18-6 5-1.7-1.5 6.2-5.3Z" fill={BRAND} />
		<circle cx="24" cy="24.5" r="4" fill={BRAND} stroke="none" />
	{:else if name === 'cap'}
		<path d="M7 31C7 19.5 13.5 12 22 12s14 6.5 14 16v3Z" fill={BRAND} />
		<path d="M7.3 26.5H36V31H7Z" fill="#fff" />
		<path d="M33 27.5c4.5-1 9-.5 11.5 1.1 1.5 1 .9 2.9-.9 2.9H33Z" fill={INK} />
		<path d="M22 12c-3.5 3.5-5.5 8.5-5.5 14.5" fill="none" stroke-width="1.75" />
		<circle cx="22" cy="12" r="1.8" fill={INK} stroke="none" />
	{:else if name === 'bag'}
		<path d="M17 18v-5a7 7 0 0 1 14 0v5" fill="none" stroke-width="2.5" />
		<path d="M8 17h32l-2 23a3 3 0 0 1-3 2.7H13A3 3 0 0 1 10 40Z" fill={BRAND} />
		<rect x="17" y="25" width="14" height="9" rx="2" fill="#fff" />
	{:else if name === 'mug'}
		<path d="M17 5.5c-1.6 1.8 1.6 3.4 0 5.5M24.5 5.5c-1.6 1.8 1.6 3.4 0 5.5" fill="none" stroke-width="2" />
		<path d="M33 20h3a5.5 5.5 0 0 1 0 11h-3" fill="none" stroke-width="2.5" />
		<path d="M9 15h24v21a6 6 0 0 1-6 6H15a6 6 0 0 1-6-6Z" fill="#fff" />
		<path d="M9 22h24v8H9Z" fill={BRAND} />
	{:else if name === 'card'}
		<rect x="4" y="10" width="40" height="28" rx="4.5" fill={BRAND} />
		<rect x="9" y="17" width="9" height="7.5" rx="1.75" fill={GOLD} stroke-width="1.75" />
		<path d="M30.5 19.5a5.5 5.5 0 0 1 0 9M35 16.5a10 10 0 0 1 0 15" fill="none" stroke="#fff" />
		<path d="M9 31h11" stroke="#fff" />
	{:else}
		<path
			d="M7 9a2 2 0 0 1 2-2h14.2a2 2 0 0 1 1.4.6l16.8 16.8a2 2 0 0 1 0 2.8L27.2 41.4a2 2 0 0 1-2.8 0L7.6 24.6A2 2 0 0 1 7 23.2Z"
			fill={BRAND}
		/>
		<circle cx="15" cy="15" r="3" fill="#fff" />
	{/if}
</svg>
