<script lang="ts">
	import WaButton from '$lib/components/shop/WaButton.svelte';
	import { waText } from '$lib/shop/wa';
	import { cn } from '$lib/utils';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head><title>{data.title} — Toko Indah Expres</title></svelte:head>

<div class="mx-auto grid max-w-5xl gap-10 px-4 pt-8 md:grid-cols-[220px_1fr]">
	<nav aria-label="Halaman info" class="-mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-col md:gap-1 md:px-0 md:pt-3">
		{#each data.pages as p (p.slug)}
			<a
				href="/shop/info/{p.slug}"
				aria-current={p.slug === data.slug ? 'page' : undefined}
				class={cn(
					'shrink-0 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap',
					p.slug === data.slug ? 'bg-brand-soft text-brand' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
				)}
			>
				{p.title}
			</a>
		{/each}
		<a href="/shop/cek-pesanan" class="shrink-0 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap text-muted-foreground hover:bg-muted hover:text-foreground">Cek pesanan</a>
	</nav>
	<article class="max-w-2xl">
		<h1 class="display text-[40px] md:text-[52px]">{data.title}</h1>
		<div class="prose-shop mt-6">{@html data.html}</div>
		{#if data.slug === 'kontak' || data.slug === 'faq' || data.slug === 'kebijakan-refund'}
			<div class="mt-8 rounded-lg border bg-muted/30 p-5">
				<p class="font-semibold">Masih ada pertanyaan?</p>
				<p class="mt-1 text-sm text-muted-foreground">Admin membalas lewat WhatsApp. Sertakan nomor pesanan bila ada.</p>
				<WaButton phone={data.waAdmin} text={waText.askAdmin()} class="mt-4" />
			</div>
		{/if}
	</article>
</div>
