<script lang="ts">
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import { tn } from '$lib/shop/i18n.svelte';
	import type { CategoryView } from '$lib/shop/types';

	let { categories }: { categories: CategoryView[] } = $props();
</script>

<ul class="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
	{#each categories as c (c.id)}
		<li>
			<a href="/shop/katalog/{c.slug}" class="group relative block aspect-[4/5] overflow-hidden rounded-lg bg-surface">
				{#if c.image}
					<img
						src={c.image.src}
						alt=""
						width="600"
						height="750"
						loading="lazy"
						class={c.image.placeholder
							? 'size-full origin-[50%_30%] scale-150 object-cover transition duration-500 group-hover:scale-[1.56]'
							: 'size-full object-cover transition duration-500 group-hover:scale-105'}
						style:object-position={c.image.src.endsWith('.jpg') ? 'center 15%' : 'center'}
					/>
				{/if}
				<span class="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent"></span>
				<span class="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4 text-white md:p-5">
					<span>
						<span class="display block text-2xl md:text-3xl">{c.name}</span>
						<span class="mt-1 block text-xs text-white/75">{tn('common.products', c.count)}</span>
					</span>
					<span class="grid size-9 shrink-0 place-items-center rounded-full bg-white text-ink transition group-hover:bg-brand group-hover:text-white">
						<ArrowRight class="size-4" />
					</span>
				</span>
			</a>
		</li>
	{/each}
</ul>
