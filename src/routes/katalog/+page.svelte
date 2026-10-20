<script lang="ts">
	import { onMount } from 'svelte';

	type Product = {
		id: string;
		name: string;
		shortName: string;
		role: string;
		desc: string;
		badge: string;
		badgeColor: string;
		material: string;
		finish: string;
		minOrder: string;
		priceFrom: string;
		priceTo: string | null;
		photos: { src: string; label: string; alt: string }[];
		activePhoto: number;
		features: string[];
		photoNote?: string;
	};

	let products = $state<Product[]>([
		{
			id: 'kemeja',
			name: 'Kemeja Lengan Pendek',
			shortName: 'Kemeja Pendek',
			role: 'Staf Kantor & Administrasi',
			desc: 'Siluet formal dengan detail aksen orange di kerah, manset, dan list saku. Kesan profesional seharian.',
			badge: 'Harian',
			badgeColor: '#E35A12',
			material: 'American Drill / Unione',
			finish: 'Bordir Premium',
			minOrder: '36 pcs',
			priceFrom: 'Rp130.900',
			priceTo: 'Rp135.900',
			features: ['Kerah formal berkancing', '2 saku tempel + tutup saku', 'Bordir logo dada kiri', 'Aksen orange di manset & list'],
			photos: [
				{ src: '/katalog/kemeja-pendek-pria.jpg', label: 'Pria', alt: 'Staf pria Indah Expres memakai kemeja putih lengan pendek dengan aksen orange' },
				{ src: '/katalog/kemeja-pendek-wanita.jpg', label: 'Wanita', alt: 'Staf wanita Indah Expres memakai kemeja putih lengan pendek dengan aksen orange' }
			],
			activePhoto: 0
		},
		{
			id: 'kemejaPanjang',
			name: 'Kemeja Lengan Panjang',
			shortName: 'Kemeja Panjang',
			role: 'Pertemuan Formal & Representasi',
			desc: 'Tampilan eksekutif dengan pilihan manset roll-up. Cocok untuk rapat, presentasi, dan acara resmi perusahaan.',
			badge: 'Formal',
			badgeColor: '#1a6db5',
			material: 'American Drill / Unione',
			finish: 'Bordir Premium',
			minOrder: '36 pcs',
			priceFrom: 'Rp152.300',
			priceTo: 'Rp159.000',
			features: ['Kerah formal berkancing', 'Manset panjang berkancing', 'Opsi roll-up lengan', 'Bordir logo di dada kiri'],
			photos: [
				{ src: '/katalog/kemeja-panjang-pria.jpg', label: 'Pria', alt: 'Staf pria Indah Expres memakai kemeja putih lengan panjang dengan aksen orange' },
				{ src: '/katalog/kemeja-panjang-wanita.jpg', label: 'Wanita', alt: 'Staf wanita Indah Expres memakai kemeja putih lengan panjang dengan aksen orange' }
			],
			activePhoto: 0
		},
		{
			id: 'kaos',
			name: 'Kaos / T-Shirt',
			shortName: 'Kaos',
			role: 'Kurir, Gudang & Lapangan',
			desc: 'Ringan, adem, dan bergerak bebas. Sablon DTF full color mempertahankan warna tajam meski sering dicuci.',
			badge: 'Lapangan',
			badgeColor: '#2d9141',
			material: 'Cotton Combed 30s / Dri-Fit 2720',
			finish: 'Sablon DTF Full Color',
			minOrder: '1 pcs',
			priceFrom: 'Rp65.000',
			priceTo: 'Rp72.000',
			features: ['Bahan adem & ringan', 'Sablon full color tahan lama', 'Cocok untuk aktivitas aktif', 'Min. order 1 pcs'],
			photos: [
				{ src: '/katalog/kaos-pria.jpg', label: 'Pria', alt: 'Kurir pria Indah Expres memakai kaos putih dengan logo orange' },
				{ src: '/katalog/kaos-wanita.jpg', label: 'Wanita', alt: 'Staf wanita Indah Expres memakai kaos putih dengan logo orange' }
			],
			activePhoto: 0
		},
		{
			id: 'polo',
			name: 'Kaos Polo',
			shortName: 'Polo',
			role: 'CS, Supervisor & Lapangan',
			desc: 'Keseimbangan antara formal dan nyaman. Lacoste pique bernapas, tampak rapi tanpa perlu kemeja.',
			badge: 'Semi-Formal',
			badgeColor: '#7c3aed',
			material: 'Lacoste Pique',
			finish: 'Bordir Dada',
			minOrder: '1 pcs',
			priceFrom: 'Rp75.000',
			priceTo: null,
			features: ['Kerah polo berkancing', 'Bahan lacoste berpori', 'Bordir logo dada kiri', 'Cocok lapangan & indoor'],
			photos: [
				{ src: '/katalog/kemeja-pendek-pria.jpg', label: 'Pria', alt: 'Ilustrasi polo Indah Expres' },
				{ src: '/katalog/kemeja-pendek-wanita.jpg', label: 'Wanita', alt: 'Ilustrasi polo Indah Expres' }
			],
			activePhoto: 0,
			photoNote: 'Foto ilustratif'
		},
		{
			id: 'rompi',
			name: 'Rompi Lapangan',
			shortName: 'Rompi',
			role: 'Driver & Tim Lapangan',
			desc: 'Rompi tactical fungsional dengan saku kargo multifungsi. Dirancang untuk mobilitas penuh di lapangan pengiriman.',
			badge: 'Driver',
			badgeColor: '#b45309',
			material: 'Taslan / Drill / Ripstop',
			finish: 'Bordir + Patch',
			minOrder: 'Hubungi Admin',
			priceFrom: 'Menyusul',
			priceTo: null,
			features: ['Saku kargo kiri & kanan', 'Resleting nilon YKK', 'Patch bordir logo', 'Tahan air ringan'],
			photos: [
				{ src: '/katalog/kemeja-panjang-pria.jpg', label: 'Ilustrasi', alt: 'Ilustrasi rompi Indah Expres' }
			],
			activePhoto: 0,
			photoNote: 'Foto ilustratif'
		}
	]);

	let activeProductIdx = $state(0);

	function selectProduct(idx: number) {
		activeProductIdx = idx;
	}

	function switchPhoto(idx: number) {
		products[activeProductIdx].activePhoto = idx;
	}

	function goToConfig(prodId: string) {
		window.location.href = `/?product=${prodId}`;
	}

	// Keyboard navigation
	function handleKey(e: KeyboardEvent) {
		if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
			activeProductIdx = Math.min(activeProductIdx + 1, products.length - 1);
		} else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
			activeProductIdx = Math.max(activeProductIdx - 1, 0);
		}
	}

	let ready = $state(false);
	onMount(() => {
		setTimeout(() => (ready = true), 50);
	});

	const activeProduct = $derived(products[activeProductIdx]);
</script>

<svelte:head>
	<title>Katalog Seragam Indah Expres — Studio Seragam</title>
	<meta name="description" content="Katalog resmi seragam Indah Expres: Kemeja Pendek, Kemeja Panjang, Kaos, Polo, dan Rompi. Warna putih dan orange brand Indah Expres." />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" />
</svelte:head>

<svelte:window onkeydown={handleKey} />

<div class="page" class:ready>
	<!-- ── TOP NAV ── -->
	<nav class="topnav">
		<a href="/" class="nav-back">
			<svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
				<path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
			</svg>
			Konfigurator 3D
		</a>

		<div class="nav-brand">
			<svg viewBox="0 0 40 40" width="32" height="32" fill="none">
				<circle cx="20" cy="20" r="20" fill="#E35A12"/>
				<path d="M10 20 H27 M21 13 L28 20 L21 27" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
			</svg>
			<div>
				<span class="nav-title">Indah Expres</span>
				<span class="nav-sub">Katalog Seragam Resmi</span>
			</div>
		</div>

		<button class="nav-order" onclick={() => goToConfig(activeProduct.id)}>
			<svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15">
				<path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z"/>
			</svg>
			Order Sekarang
		</button>
	</nav>

	<!-- ── MAIN LAYOUT ── -->
	<div class="main">
		<!-- LEFT: Product list sidebar -->
		<aside class="sidebar">
			<div class="sidebar-head">
				<h1 class="sidebar-title">Koleksi<br>Seragam</h1>
				<p class="sidebar-sub">5 model pilihan<br>Putih × Orange</p>
			</div>

			<nav class="prod-list" aria-label="Daftar produk">
				{#each products as prod, i}
					<button
						class="prod-item"
						class:active={activeProductIdx === i}
						onclick={() => selectProduct(i)}
						aria-selected={activeProductIdx === i}
					>
						<div class="prod-item-badge" style="background:{prod.badgeColor}">{prod.badge}</div>
						<div class="prod-item-info">
							<span class="prod-item-name">{prod.shortName}</span>
							<span class="prod-item-role">{prod.role}</span>
						</div>
						<div class="prod-item-price">
							{prod.priceFrom}<br>
							{#if prod.priceTo}<span class="up-to">s/d {prod.priceTo}</span>{/if}
						</div>
					</button>
				{/each}
			</nav>

			<!-- Orange accent strip -->
			<div class="sidebar-footer">
				<div class="color-chips">
					<div class="chip white"><span></span>Putih</div>
					<div class="chip orange"><span></span>Orange</div>
				</div>
				<p class="sidebar-note">Warna resmi brand<br>Indah Expres</p>
			</div>
		</aside>

		<!-- CENTER: Giant model photo -->
		<section class="stage" aria-label="Foto model seragam">
			{#each products as prod, pi}
				<div class="photo-slide" class:visible={activeProductIdx === pi} aria-hidden={activeProductIdx !== pi}>
					{#each prod.photos as ph, phIdx}
						<img
							src={ph.src}
							alt={ph.alt}
							class="model-img"
							class:model-visible={prod.activePhoto === phIdx}
							loading={pi === 0 ? 'eager' : 'lazy'}
						/>
					{/each}
				</div>
			{/each}

			<!-- Gender toggle -->
			{#if activeProduct.photos.length > 1}
				<div class="gender-pills">
					{#each activeProduct.photos as ph, phIdx}
						<button
							class="gender-pill"
							class:active={activeProduct.activePhoto === phIdx}
							onclick={() => switchPhoto(phIdx)}
						>
							{ph.label}
						</button>
					{/each}
				</div>
			{/if}

			<!-- Product badge overlay -->
			<div class="stage-badge" style="background:{activeProduct.badgeColor}">
				{activeProduct.badge}
			</div>

			<!-- Photo note if applicable -->
			{#if activeProduct.photoNote}
				<div class="photo-note-overlay">{activeProduct.photoNote}</div>
			{/if}

			<!-- Navigation arrows -->
			<button
				class="nav-arrow left"
				onclick={() => activeProductIdx = Math.max(0, activeProductIdx - 1)}
				disabled={activeProductIdx === 0}
				aria-label="Produk sebelumnya"
			>
				<svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
					<path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
				</svg>
			</button>
			<button
				class="nav-arrow right"
				onclick={() => activeProductIdx = Math.min(products.length - 1, activeProductIdx + 1)}
				disabled={activeProductIdx === products.length - 1}
				aria-label="Produk berikutnya"
			>
				<svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
					<path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
				</svg>
			</button>

			<!-- Dot indicators -->
			<div class="dots">
				{#each products as _, di}
					<button
						class="dot"
						class:active={activeProductIdx === di}
						onclick={() => selectProduct(di)}
						aria-label="Pilih produk {di + 1}"
					></button>
				{/each}
			</div>
		</section>

		<!-- RIGHT: Product detail panel -->
		<aside class="detail-panel">
			{#key activeProductIdx}
				<div class="detail-content">
					<!-- Header -->
					<div class="detail-header">
						<span class="detail-role">{activeProduct.role}</span>
						<h2 class="detail-name">{activeProduct.name}</h2>
					</div>

					<!-- Price -->
					<div class="detail-price">
						<span class="price-from">{activeProduct.priceFrom}</span>
						{#if activeProduct.priceTo}
							<span class="price-sep">–</span>
							<span class="price-to">{activeProduct.priceTo}</span>
							<span class="price-unit">/pcs</span>
						{:else if activeProduct.id === 'rompi'}
							<span class="price-unit">hubungi admin</span>
						{:else}
							<span class="price-unit">/pcs</span>
						{/if}
					</div>

					<!-- Description -->
					<p class="detail-desc">{activeProduct.desc}</p>

					<!-- Features -->
					<ul class="feature-list">
						{#each activeProduct.features as feat}
							<li class="feature-item">
								<span class="feat-check">✓</span>
								{feat}
							</li>
						{/each}
					</ul>

					<!-- Specs grid -->
					<div class="specs-grid">
						<div class="spec">
							<span class="spec-k">Bahan</span>
							<span class="spec-v">{activeProduct.material}</span>
						</div>
						<div class="spec">
							<span class="spec-k">Finishing</span>
							<span class="spec-v">{activeProduct.finish}</span>
						</div>
						<div class="spec">
							<span class="spec-k">Min. Order</span>
							<span class="spec-v">{activeProduct.minOrder}</span>
						</div>
					</div>

					<!-- Color stripe -->
					<div class="color-stripe">
						<span class="cs-label">Warna Brand</span>
						<div class="cs-pair">
							<div class="cs-swatch white-s" title="Putih — Body utama">
								<div class="cs-dot"></div>
								<span>Putih</span>
							</div>
							<svg viewBox="0 0 16 16" width="14" height="14" fill="none">
								<path d="M3 8h10M9 4l4 4-4 4" stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round"/>
							</svg>
							<div class="cs-swatch orange-s" title="Orange #E35A12 — Aksen & logo">
								<div class="cs-dot"></div>
								<span>Orange</span>
							</div>
						</div>
					</div>

					<!-- CTA buttons -->
					<div class="cta-group">
						<button
							class="cta-primary"
							onclick={() => goToConfig(activeProduct.id)}
						>
							<svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
								<path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
							</svg>
							Kustomisasi 3D Sekarang
						</button>
						<a href="https://wa.me/6281200000000?text=Halo%2C%20saya%20ingin%20order%20seragam%20Indah%20Expres%20{encodeURIComponent(activeProduct.name)}" class="cta-wa" target="_blank" rel="noopener">
							<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
								<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
								<path fill-rule="evenodd" d="M12 0C5.373 0 0 5.373 0 12c0 2.124.555 4.122 1.528 5.855L.057 23.57a.5.5 0 00.614.615l5.704-1.47A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.957 0-3.78-.512-5.358-1.408l-.385-.218-3.994 1.027 1.047-3.885-.24-.38A9.955 9.955 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" clip-rule="evenodd" />
							</svg>
							Tanya via WhatsApp
						</a>
					</div>
				</div>
			{/key}
		</aside>
	</div>
</div>

<style>
	:global(*, *::before, *::after) { box-sizing: border-box; }
	:global(body) {
		margin: 0;
		background: #0d0d0d;
		font-family: 'Inter', system-ui, -apple-system, sans-serif;
		-webkit-font-smoothing: antialiased;
	}

	/* ── PAGE ── */
	.page {
		display: flex;
		flex-direction: column;
		height: 100dvh;
		overflow: hidden;
		background: #0d0d0d;
		opacity: 0;
		transition: opacity 0.4s ease;
	}
	.page.ready { opacity: 1; }

	/* ── TOP NAV ── */
	.topnav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 14px 24px;
		border-bottom: 1px solid rgba(255,255,255,0.08);
		flex-shrink: 0;
		z-index: 10;
	}

	.nav-back {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		color: rgba(255,255,255,0.5);
		text-decoration: none;
		font-size: 13px;
		font-weight: 500;
		transition: color 0.15s;
	}
	.nav-back:hover { color: rgba(255,255,255,0.9); }

	.nav-brand {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.nav-title {
		display: block;
		font-size: 15px;
		font-weight: 800;
		color: #fff;
		line-height: 1;
	}

	.nav-sub {
		display: block;
		font-size: 11px;
		color: #E35A12;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		margin-top: 2px;
	}

	.nav-order {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		padding: 9px 18px;
		background: #E35A12;
		color: #fff;
		border: none;
		border-radius: 8px;
		font-size: 13px;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.18s ease;
	}
	.nav-order:hover {
		background: #ff6b1f;
		transform: translateY(-1px);
		box-shadow: 0 4px 16px rgba(227, 90, 18, 0.4);
	}

	/* ── MAIN LAYOUT ── */
	.main {
		display: grid;
		grid-template-columns: 280px 1fr 340px;
		flex: 1;
		min-height: 0;
		overflow: hidden;
	}

	/* ── SIDEBAR ── */
	.sidebar {
		display: flex;
		flex-direction: column;
		border-right: 1px solid rgba(255,255,255,0.06);
		overflow-y: auto;
		padding: 28px 20px 20px;
		scrollbar-width: none;
	}
	.sidebar::-webkit-scrollbar { display: none; }

	.sidebar-head { margin-bottom: 28px; }

	.sidebar-title {
		margin: 0 0 6px;
		font-size: 28px;
		font-weight: 900;
		color: #fff;
		line-height: 1.1;
		letter-spacing: -0.02em;
	}

	.sidebar-sub {
		margin: 0;
		font-size: 12px;
		color: rgba(255,255,255,0.4);
		line-height: 1.5;
	}

	.prod-list {
		display: flex;
		flex-direction: column;
		gap: 6px;
		flex: 1;
	}

	.prod-item {
		display: flex;
		align-items: flex-start;
		gap: 10px;
		padding: 12px 14px;
		border-radius: 12px;
		border: 1px solid rgba(255,255,255,0.06);
		background: transparent;
		cursor: pointer;
		transition: all 0.18s ease;
		text-align: left;
		width: 100%;
	}

	.prod-item:hover {
		background: rgba(255,255,255,0.05);
		border-color: rgba(255,255,255,0.12);
	}

	.prod-item.active {
		background: rgba(227, 90, 18, 0.12);
		border-color: rgba(227, 90, 18, 0.4);
	}

	.prod-item-badge {
		padding: 3px 8px;
		border-radius: 6px;
		font-size: 9px;
		font-weight: 800;
		color: #fff;
		letter-spacing: 0.07em;
		text-transform: uppercase;
		white-space: nowrap;
		flex-shrink: 0;
		margin-top: 2px;
	}

	.prod-item-info {
		flex: 1;
		min-width: 0;
	}

	.prod-item-name {
		display: block;
		font-size: 13px;
		font-weight: 700;
		color: #fff;
		margin-bottom: 2px;
	}

	.prod-item.active .prod-item-name { color: #ff7c3a; }

	.prod-item-role {
		display: block;
		font-size: 11px;
		color: rgba(255,255,255,0.4);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.prod-item-price {
		font-size: 10px;
		font-weight: 700;
		color: #E35A12;
		text-align: right;
		line-height: 1.4;
		flex-shrink: 0;
	}
	.up-to { font-weight: 500; color: rgba(227, 90, 18, 0.7); }

	.sidebar-footer {
		margin-top: 20px;
		padding-top: 16px;
		border-top: 1px solid rgba(255,255,255,0.06);
	}

	.color-chips {
		display: flex;
		gap: 10px;
		margin-bottom: 8px;
	}

	.chip {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 11px;
		font-weight: 600;
		color: rgba(255,255,255,0.5);
	}

	.chip span {
		width: 14px;
		height: 14px;
		border-radius: 50%;
		display: block;
	}

	.chip.white span { background: #fff; border: 1px solid rgba(255,255,255,0.3); }
	.chip.orange span { background: #E35A12; }

	.sidebar-note {
		margin: 0;
		font-size: 11px;
		color: rgba(255,255,255,0.25);
		line-height: 1.5;
	}

	/* ── STAGE (CENTER PHOTO) ── */
	.stage {
		position: relative;
		background: #141414;
		overflow: hidden;
		display: flex;
		align-items: stretch;
	}

	/* Subtle grid pattern overlay */
	.stage::before {
		content: '';
		position: absolute;
		inset: 0;
		background-image:
			linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
			linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
		background-size: 40px 40px;
		pointer-events: none;
		z-index: 0;
	}

	/* Bottom gradient vignette */
	.stage::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 35%;
		background: linear-gradient(to top, rgba(20,20,20,0.85), transparent);
		pointer-events: none;
		z-index: 1;
	}

	.photo-slide {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		opacity: 0;
		transition: opacity 0.45s ease;
		pointer-events: none;
	}

	.photo-slide.visible {
		opacity: 1;
		pointer-events: auto;
	}

	.model-img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: top center;
		opacity: 0;
		transition: opacity 0.35s ease;
		z-index: 0;
	}

	.model-img.model-visible { opacity: 1; }

	/* Gender toggle */
	.gender-pills {
		position: absolute;
		bottom: 80px;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		gap: 6px;
		z-index: 10;
	}

	.gender-pill {
		padding: 7px 18px;
		border-radius: 24px;
		border: 1.5px solid rgba(255,255,255,0.3);
		background: rgba(0,0,0,0.55);
		color: rgba(255,255,255,0.8);
		font-size: 12px;
		font-weight: 700;
		cursor: pointer;
		backdrop-filter: blur(12px);
		transition: all 0.18s ease;
		letter-spacing: 0.04em;
	}

	.gender-pill.active {
		background: #E35A12;
		border-color: #E35A12;
		color: #fff;
	}

	.gender-pill:hover:not(.active) {
		background: rgba(255,255,255,0.15);
		border-color: rgba(255,255,255,0.5);
		color: #fff;
	}

	/* Overlay badges */
	.stage-badge {
		position: absolute;
		top: 20px;
		left: 20px;
		padding: 6px 14px;
		border-radius: 8px;
		font-size: 10px;
		font-weight: 800;
		color: #fff;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		z-index: 10;
		box-shadow: 0 2px 12px rgba(0,0,0,0.3);
	}

	.photo-note-overlay {
		position: absolute;
		bottom: 108px;
		left: 50%;
		transform: translateX(-50%);
		font-size: 10px;
		color: rgba(255,255,255,0.4);
		z-index: 10;
		white-space: nowrap;
	}

	/* Navigation arrows */
	.nav-arrow {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		width: 44px;
		height: 44px;
		border-radius: 50%;
		border: 1px solid rgba(255,255,255,0.15);
		background: rgba(0,0,0,0.5);
		color: rgba(255,255,255,0.7);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.18s ease;
		backdrop-filter: blur(8px);
		z-index: 10;
	}

	.nav-arrow.left { left: 16px; }
	.nav-arrow.right { right: 16px; }

	.nav-arrow:hover:not(:disabled) {
		background: rgba(227, 90, 18, 0.7);
		border-color: #E35A12;
		color: #fff;
	}
	.nav-arrow:disabled { opacity: 0.2; cursor: default; }

	/* Dots */
	.dots {
		position: absolute;
		bottom: 24px;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		gap: 8px;
		z-index: 10;
	}

	.dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		border: none;
		background: rgba(255,255,255,0.25);
		cursor: pointer;
		transition: all 0.2s ease;
		padding: 0;
	}

	.dot.active {
		background: #E35A12;
		width: 22px;
		border-radius: 4px;
	}

	/* ── DETAIL PANEL ── */
	.detail-panel {
		border-left: 1px solid rgba(255,255,255,0.06);
		overflow-y: auto;
		scrollbar-width: none;
		display: flex;
		flex-direction: column;
	}
	.detail-panel::-webkit-scrollbar { display: none; }

	.detail-content {
		padding: 36px 28px;
		display: flex;
		flex-direction: column;
		gap: 24px;
		animation: slideIn 0.3s ease;
	}

	@keyframes slideIn {
		from { opacity: 0; transform: translateX(12px); }
		to { opacity: 1; transform: translateX(0); }
	}

	.detail-header { }

	.detail-role {
		display: block;
		font-size: 11px;
		font-weight: 700;
		color: #E35A12;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		margin-bottom: 8px;
	}

	.detail-name {
		margin: 0;
		font-size: 26px;
		font-weight: 900;
		color: #fff;
		line-height: 1.15;
		letter-spacing: -0.02em;
	}

	.detail-price {
		display: flex;
		align-items: baseline;
		gap: 5px;
	}

	.price-from {
		font-size: 28px;
		font-weight: 800;
		color: #E35A12;
		letter-spacing: -0.02em;
	}
	.price-sep { color: rgba(255,255,255,0.3); font-size: 18px; }
	.price-to { font-size: 20px; font-weight: 700; color: rgba(227,90,18,0.7); }
	.price-unit { font-size: 13px; color: rgba(255,255,255,0.35); font-weight: 500; }

	.detail-desc {
		margin: 0;
		font-size: 14px;
		color: rgba(255,255,255,0.55);
		line-height: 1.65;
	}

	/* Features */
	.feature-list {
		margin: 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.feature-item {
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 13px;
		color: rgba(255,255,255,0.7);
		font-weight: 500;
	}

	.feat-check {
		width: 20px;
		height: 20px;
		background: rgba(227, 90, 18, 0.15);
		border: 1px solid rgba(227, 90, 18, 0.3);
		border-radius: 50%;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 10px;
		color: #E35A12;
		flex-shrink: 0;
		font-weight: 800;
	}

	/* Specs */
	.specs-grid {
		display: flex;
		flex-direction: column;
		gap: 0;
		border: 1px solid rgba(255,255,255,0.08);
		border-radius: 12px;
		overflow: hidden;
	}

	.spec {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 11px 16px;
		border-bottom: 1px solid rgba(255,255,255,0.06);
	}
	.spec:last-child { border-bottom: none; }

	.spec-k {
		font-size: 11px;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-weight: 600;
		color: rgba(255,255,255,0.3);
	}

	.spec-v {
		font-size: 13px;
		font-weight: 700;
		color: rgba(255,255,255,0.85);
		text-align: right;
	}

	/* Color stripe */
	.color-stripe {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 14px 16px;
		background: rgba(255,255,255,0.03);
		border: 1px solid rgba(255,255,255,0.07);
		border-radius: 12px;
	}

	.cs-label {
		font-size: 11px;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-weight: 600;
		color: rgba(255,255,255,0.3);
	}

	.cs-pair {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.cs-swatch {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 12px;
		font-weight: 600;
		color: rgba(255,255,255,0.6);
	}

	.cs-dot {
		width: 18px;
		height: 18px;
		border-radius: 50%;
	}

	.white-s .cs-dot { background: #fff; box-shadow: 0 0 0 2px rgba(255,255,255,0.15); }
	.orange-s .cs-dot { background: #E35A12; box-shadow: 0 0 0 2px rgba(227,90,18,0.3); }

	/* CTA */
	.cta-group {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding-bottom: 8px;
	}

	.cta-primary {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 9px;
		padding: 15px 20px;
		background: #E35A12;
		color: #fff;
		border: none;
		border-radius: 12px;
		font-size: 14px;
		font-weight: 800;
		cursor: pointer;
		transition: all 0.2s ease;
		letter-spacing: 0.01em;
	}

	.cta-primary:hover {
		background: #ff6b1f;
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(227, 90, 18, 0.45);
	}

	.cta-wa {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 9px;
		padding: 13px 20px;
		background: transparent;
		color: rgba(255,255,255,0.7);
		border: 1px solid rgba(255,255,255,0.12);
		border-radius: 12px;
		font-size: 13px;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.18s ease;
		text-decoration: none;
	}

	.cta-wa:hover {
		background: rgba(37, 211, 102, 0.1);
		border-color: rgba(37, 211, 102, 0.4);
		color: #25d366;
	}

	/* ── RESPONSIVE ── */
	@media (max-width: 1100px) {
		.main {
			grid-template-columns: 240px 1fr 300px;
		}
	}

	@media (max-width: 900px) {
		.page { height: auto; overflow: auto; }

		.main {
			grid-template-columns: 1fr;
			grid-template-rows: auto auto auto;
		}

		.sidebar {
			border-right: none;
			border-bottom: 1px solid rgba(255,255,255,0.06);
			flex-direction: row;
			flex-wrap: nowrap;
			overflow-x: auto;
			overflow-y: hidden;
			padding: 14px 16px;
			gap: 10px;
		}

		.sidebar-head { display: none; }
		.sidebar-footer { display: none; }

		.prod-list {
			flex-direction: row;
			gap: 8px;
		}

		.prod-item {
			flex-direction: column;
			align-items: flex-start;
			gap: 4px;
			min-width: 130px;
			padding: 10px 12px;
		}

		.prod-item-price { font-size: 9px; }

		.stage { min-height: 460px; }

		.detail-panel {
			border-left: none;
			border-top: 1px solid rgba(255,255,255,0.06);
		}

		.detail-content { padding: 24px 20px; }
	}
</style>
