<script lang="ts">
	import { rupiah } from '$lib/shop/format';
	import type { ProductCardView } from '$lib/shop/types';

	/** Kartu produk ringkas (gaya fanshop): foto persegi, nama, harga */
	let { product }: { product: ProductCardView } = $props();

	const first = $derived(product.images[0]);
	// Foto orang: tampilkan bagian atas. Gambar sementara: potong area kosong di atas supaya logo bawah tetap terlihat
	const position = $derived(
		!first ? 'center' : first.placeholder ? 'center 75%' : first.src.endsWith('.jpg') ? 'center 15%' : 'center'
	);
</script>

<a href="/shop/produk/{product.slug}" class="group block rounded-xl outline-offset-4">
	<div class="relative aspect-square overflow-hidden rounded-xl bg-surface">
		{#if first}
			<img
				src={first.src}
				alt={first.alt}
				width="800"
				height="1000"
				loading="lazy"
				decoding="async"
				class="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-[1.03]"
				style:object-position={position}
				style:scale={first.zoom}
			/>
		{/if}
	</div>
	<h3 class="mt-4 line-clamp-2 text-base leading-snug text-ink transition-colors group-hover:text-brand md:text-lg">{product.name}</h3>
	<p class="mt-1 font-ui text-xl font-bold text-ink md:text-2xl">{rupiah(product.price)}</p>
</a>
