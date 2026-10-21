<script lang="ts">
	import { PRODUCTS, ORDER, fmt } from '$lib/constants/catalog';
	import { PRODUCT_ICONS } from '$lib/constants/icons';
	import { CLIENT_CONFIG } from '$lib/client-config';
	import type { ProductKey } from '$lib/types/uniform';

	/** zoom: perbesar sedikit untuk memotong tepi foto yang kurang rapi */
	type Photo = { src: string; label: string; alt: string; zoom?: number };

	/** Info khusus katalog; harga, bahan & min. order diambil dari PRODUCTS agar selalu sama dengan konfigurator */
	const INFO: Record<ProductKey, { role: string; desc: string; photos: Photo[] }> = {
		kemeja: {
			role: 'Staf kantor & administrasi',
			desc: 'Kemeja putih formal dengan aksen oranye di kerah, lengan, dan list saku.',
			photos: [
				{ src: '/katalog/kemeja-pendek-pria.jpg', label: 'Pria', alt: 'Staf pria memakai kemeja putih lengan pendek beraksen oranye' },
				{ src: '/katalog/kemeja-pendek-wanita.jpg', label: 'Wanita', alt: 'Staf wanita memakai kemeja putih lengan pendek beraksen oranye' }
			]
		},
		kemejaPanjang: {
			role: 'Rapat & acara resmi',
			desc: 'Tampilan eksekutif dengan manset berkancing, bisa digulung.',
			photos: [
				{ src: '/katalog/kemeja-panjang-pria.jpg', label: 'Pria', alt: 'Staf pria memakai kemeja putih lengan panjang beraksen oranye', zoom: 1.14 },
				{ src: '/katalog/kemeja-panjang-wanita.jpg', label: 'Wanita', alt: 'Staf wanita memakai kemeja putih lengan panjang beraksen oranye' }
			]
		},
		kaos: {
			role: 'Kurir, gudang & lapangan',
			desc: 'Ringan dan adem untuk bergerak aktif. Sablon DTF tetap tajam setelah dicuci.',
			photos: [
				{ src: '/katalog/kaos-pria.jpg', label: 'Pria', alt: 'Kurir pria memakai kaos dengan logo oranye' },
				{ src: '/katalog/kaos-wanita.jpg', label: 'Wanita', alt: 'Staf wanita memakai kaos dengan logo oranye' }
			]
		},
		polo: {
			role: 'CS & supervisor',
			desc: 'Rapi tanpa harus berkemeja. Bahan lacoste berpori, nyaman dipakai seharian.',
			photos: []
		},
		rompi: {
			role: 'Driver & tim lapangan',
			desc: 'Rompi dengan saku kargo dan list reflektif untuk mobilitas di jalan.',
			photos: []
		}
	};

	const FINISH = { bordir: 'Bordir', sablon: 'Sablon DTF' } as const;

	const items = ORDER.map(id => {
		const P = PRODUCTS[id];
		const prices = P.materials.map(m => m.promo).filter((v): v is number => v != null);
		return {
			id,
			name: P.name,
			price: prices.length ? fmt(Math.min(...prices)) : null,
			minOrder: P.minOrder ? `Min. ${P.minOrder} pcs` : 'Min. order menyusul',
			material: P.materials.map(m => m.name).join(' / '),
			finish: FINISH[P.finish],
			...INFO[id]
		};
	});

	let photoIdx = $state<Record<string, number>>({});

	const waLink = `https://wa.me/${CLIENT_CONFIG.waNumber}?text=${encodeURIComponent(
		'Halo, saya ingin tanya seragam Indah Expres.'
	)}`;
</script>

<svelte:head>
	<title>Katalog Seragam — Indah Expres</title>
	<meta
		name="description"
		content="Katalog seragam Indah Expres: kemeja lengan pendek & panjang, kaos, polo, dan rompi. Desain sendiri di konfigurator 3D."
	/>
</svelte:head>

<div class="page">
	<header class="top">
		<a href="/" class="back">
			<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4l-6 6 6 6"/></svg>
			<span>Konfigurator</span>
		</a>
		<img class="brand logo-light" src={CLIENT_CONFIG.logoUrl} alt="Indah Expres" width="106" height="100" />
		<img class="brand logo-dark" src={CLIENT_CONFIG.logoDarkUrl} alt="Indah Expres" width="106" height="100" />
	</header>

	<section class="intro">
		<h1>Katalog Seragam</h1>
		<p>Pilih model, lalu atur warna, logo, dan ukurannya di konfigurator 3D.</p>
	</section>

	<ul class="grid">
		{#each items as it (it.id)}
			{@const idx = photoIdx[it.id] ?? 0}
			<li class="card">
				<div class="media" class:empty={!it.photos.length}>
					{#if it.photos.length}
						{#each it.photos as ph, i}
							<img
								src={ph.src}
								alt={ph.alt}
								class:show={i === idx}
								style:--zoom={ph.zoom ?? 1}
								loading={i === 0 ? 'eager' : 'lazy'}
								decoding="async"
							/>
						{/each}
						{#if it.photos.length > 1}
							<div class="seg" role="group" aria-label="Pilih foto">
								{#each it.photos as ph, i}
									<button
										type="button"
										aria-pressed={i === idx}
										onclick={() => (photoIdx[it.id] = i)}>{ph.label}</button
									>
								{/each}
							</div>
						{/if}
					{:else}
						<div class="placeholder">
							{@html PRODUCT_ICONS[it.id]}
							<span>Foto menyusul — lihat bentuknya di 3D</span>
						</div>
					{/if}
				</div>

				<div class="body">
					<p class="role">{it.role}</p>
					<h2>{it.name}</h2>
					<p class="desc">{it.desc}</p>

					<dl class="specs">
						<div><dt>Bahan</dt><dd>{it.material}</dd></div>
						<div><dt>Logo</dt><dd>{it.finish}</dd></div>
					</dl>

					<div class="foot">
						<div class="price">
							{#if it.price}
								<small>mulai</small>
								<b>{it.price}</b>
							{:else}
								<b class="tbd">Harga menyusul</b>
							{/if}
							<span class="min">{it.minOrder}</span>
						</div>
						<a class="cta" href="/?product={it.id}">
							Desain
							<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 10h10M11 6l4 4-4 4"/></svg>
						</a>
					</div>
				</div>
			</li>
		{/each}
	</ul>

	<footer class="help">
		<span>Butuh bantuan memilih?</span>
		<a href={waLink} target="_blank" rel="noopener">Tanya admin via WhatsApp</a>
	</footer>
</div>

<style>
	.page {
		max-width: 1180px;
		margin: 0 auto;
		padding: 16px 20px 40px;
	}

	/* ── Top bar ── */
	.top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		min-height: 44px;
	}

	.back {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		min-height: 40px;
		padding: 0 12px 0 6px;
		border-radius: 10px;
		color: var(--ink-2);
		font-weight: 600;
		font-size: 14px;
		text-decoration: none;
	}

	.back:hover {
		background: var(--sheet-2);
		color: var(--ink);
	}

	.back svg {
		width: 18px;
		height: 18px;
	}

	.brand {
		display: block;
		height: 52px;
		width: auto;
	}

	/* Logo teks hitam tak terbaca di mode gelap → pakai varian teks terang */
	.logo-dark {
		display: none;
	}

	:global(:root[data-theme='dark']) .logo-light {
		display: none;
	}

	:global(:root[data-theme='dark']) .logo-dark {
		display: block;
	}

	@media (prefers-color-scheme: dark) {
		:global(:root:not([data-theme='light'])) .logo-light {
			display: none;
		}

		:global(:root:not([data-theme='light'])) .logo-dark {
			display: block;
		}
	}

	/* ── Intro ── */
	.intro {
		padding: 28px 0 24px;
	}

	.intro h1 {
		margin: 0;
		font: 700 clamp(32px, 5vw, 44px) / 1 var(--f-display);
		text-transform: uppercase;
		letter-spacing: 0.01em;
	}

	.intro p {
		margin: 8px 0 0;
		max-width: 52ch;
		color: var(--ink-2);
		font-size: 15px;
	}

	/* ── Grid ── */
	.grid {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 20px;
	}

	.card {
		display: flex;
		flex-direction: column;
		background: var(--sheet);
		border: 1px solid var(--line);
		border-radius: 16px;
		overflow: hidden;
	}

	.media {
		position: relative;
		aspect-ratio: 4 / 5;
		background: #e9eaeb;
		overflow: hidden;
	}

	.media.empty {
		background: var(--sheet-2);
	}

	.media img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center 15%;
		transform: scale(var(--zoom, 1));
		transform-origin: center 40%;
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.media img.show {
		opacity: 1;
	}

	.seg {
		position: absolute;
		left: 12px;
		bottom: 12px;
		display: flex;
		padding: 3px;
		gap: 2px;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.85);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
	}

	.seg button {
		min-height: 32px;
		padding: 0 14px;
		border: 0;
		border-radius: 999px;
		background: transparent;
		color: #4d5a66;
		font-size: 13px;
		font-weight: 600;
	}

	.seg button[aria-pressed='true'] {
		background: #17202a;
		color: #fff;
	}

	.placeholder {
		position: absolute;
		inset: 0;
		display: grid;
		place-content: center;
		justify-items: center;
		gap: 14px;
		color: var(--ink-3);
		font-size: 13px;
		font-weight: 500;
	}

	.placeholder :global(svg) {
		width: 112px;
		height: 112px;
		color: #e35a12;
		opacity: 0.55;
	}

	.body {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 16px 18px 18px;
	}

	.role {
		margin: 0;
		font-size: 12px;
		font-weight: 600;
		color: #e35a12;
	}

	.body h2 {
		margin: 2px 0 0;
		font: 700 24px/1.1 var(--f-display);
		text-transform: uppercase;
		letter-spacing: 0.01em;
	}

	.desc {
		margin: 6px 0 0;
		font-size: 14px;
		line-height: 1.5;
		color: var(--ink-2);
	}

	.specs {
		margin: 14px 0 0;
		display: grid;
		gap: 4px;
		font-size: 13px;
	}

	.specs div {
		display: flex;
		gap: 8px;
	}

	.specs dt {
		flex: none;
		width: 48px;
		color: var(--ink-3);
	}

	.specs dd {
		margin: 0;
		color: var(--ink);
	}

	.foot {
		margin-top: auto;
		padding-top: 16px;
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 12px;
	}

	.price {
		display: grid;
		line-height: 1.2;
	}

	.price small {
		font-size: 12px;
		color: var(--ink-3);
	}

	.price b {
		font: 600 18px/1.2 var(--f-mono);
		font-variant-numeric: tabular-nums;
	}

	.price b.tbd {
		font: 600 15px/1.3 var(--f-body);
	}

	.price .min {
		font-size: 12px;
		color: var(--ink-3);
	}

	.cta {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		min-height: 44px;
		padding: 0 18px;
		border-radius: 12px;
		background: #e35a12;
		color: #fff;
		font-weight: 600;
		font-size: 15px;
		text-decoration: none;
		white-space: nowrap;
		transition: background 0.15s ease;
	}

	.cta:hover {
		background: #c94e0e;
	}

	.cta svg {
		width: 18px;
		height: 18px;
	}

	/* ── Footer help ── */
	.help {
		margin-top: 32px;
		padding-top: 20px;
		border-top: 1px solid var(--line);
		display: flex;
		flex-wrap: wrap;
		gap: 4px 8px;
		justify-content: center;
		font-size: 14px;
		color: var(--ink-2);
	}

	.help a {
		color: var(--ink);
		font-weight: 600;
		text-underline-offset: 3px;
	}

	@media (max-width: 600px) {
		.page {
			padding: 8px 16px 32px;
		}

		.intro {
			padding: 16px 0 18px;
		}

		.brand {
			height: 44px;
		}

		.intro p {
			font-size: 14px;
		}

		.grid {
			grid-template-columns: 1fr;
			gap: 16px;
		}

		.media {
			aspect-ratio: 1 / 1;
		}
	}
</style>
