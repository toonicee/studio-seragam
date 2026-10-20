<script lang="ts">
	import { uniformStore } from '$lib/stores/uniform.svelte';
	import { ORDER, PRODUCTS, WEAVE_LABEL, fmt } from '$lib/constants/catalog';
	import { weaveSwatch } from '$lib/three/textures';
	import type { ProductKey } from '$lib/types/uniform';

	const ICONS: Record<ProductKey, string> = {
		kemeja: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M17 6 10 9 4 17l5 4 4-4v25h22V17l4 4 5-4-6-8-7-3-7 6z"/><path d="M17 6l7 6-4 4zM31 6l-7 6 4 4zM24 12v30"/><path d="M15 23h6v5h-6zM27 23h6v5h-6z" stroke-width="1.2"/></svg>`,
		kemejaPanjang: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M17 6 10 9 6 24l-1 16 5 1 3-17v18h22V24l3 17 5-1-1-16-4-15-7-3-7 6z"/><path d="M17 6l7 6-4 4zM31 6l-7 6 4 4zM24 12v30"/><path d="M5 36h5M38 36h5" stroke-width="1.2"/></svg>`,
		kaos: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M17 6 10 9 4 17l5 4 4-4v25h22V17l4 4 5-4-6-8-7-3c-2 3-12 3-14 0z"/><path d="M18 7.5c2.5 2.5 9.5 2.5 12 0" stroke-width="1.2"/></svg>`,
		rompi: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M17 4 12 8v7c2.2 2.5 2.2 6.5 0 9v18h11.6V8.5L20 4zM31 4l5 4v7c-2.2 2.5-2.2 6.5 0 9v18H24.4V8.5L28 4z"/><path d="M14 31h7v6h-7zM27 31h7v6h-7z" stroke-width="1.2"/><path d="M15 17h6M27 17h6" stroke-width="2"/></svg>`,
		polo: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M17 6 10 9 4 17l5 4 4-4v25h22V17l4 4 5-4-6-8-7-3-7 4z"/><path d="M17 6l7 4-3 4zM31 6l-7 4 3 4zM24 10v10"/><circle cx="24" cy="14" r=".8" fill="currentColor"/><circle cx="24" cy="18" r=".8" fill="currentColor"/></svg>`
	};

	const CHECK_ICON = `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10.5l4 4 8-9"/></svg>`;

	function getMinPriceText(pid: ProductKey) {
		const p = PRODUCTS[pid];
		const priced = p.materials.filter(m => m.promo != null);
		if (!priced.length) return 'harga <b>menyusul</b>';
		const minPromo = Math.min(...priced.map(x => x.promo!));
		return `mulai <b>${fmt(minPromo)}</b>`;
	}
</script>

<div class="tabpanel">
	<!-- Model Seragam -->
	<div class="sec">
		<h2 class="h">Model seragam</h2>
		<div class="prod-grid">
			{#each ORDER as id}
				{@const p = PRODUCTS[id]}
				{@const on = id === uniformStore.state.product}
				<button
					type="button"
					class="prod"
					aria-pressed={on}
					onclick={() => uniformStore.setProduct(id)}
				>
					{@html ICONS[id]}
					<span class="prod-name">{p.name}</span>
					<span class="prod-meta">{@html getMinPriceText(id)}</span>
					<span class="prod-min">
						{p.minOrder ? `min. ${p.minOrder} pcs` : 'min. order menyusul'}
					</span>
				</button>
			{/each}
		</div>
	</div>

	<!-- Opsi Lengan Panjang -->
	{#if uniformStore.state.product === 'kemejaPanjang'}
		<div class="sec">
			<h3 class="lbl">Gaya lengan</h3>
			<div class="pat-grid">
				<button
					type="button"
					class="pat"
					aria-pressed={uniformStore.state.sleeveStyle !== 'gulung'}
					onclick={() => uniformStore.setSleeveStyle('panjang')}
				>
					<svg viewBox="0 0 46 40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true">
						<path d="M15 3h11l4 31-12 1z" />
						<path d="M18.4 30l11.2-1" />
						<circle cx="25" cy="32" r=".9" fill="currentColor" />
					</svg>
					<span><b>Panjang</b><small>Manset berkancing</small></span>
				</button>
				<button
					type="button"
					class="pat"
					aria-pressed={uniformStore.state.sleeveStyle === 'gulung'}
					onclick={() => uniformStore.setSleeveStyle('gulung')}
				>
					<svg viewBox="0 0 46 40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true">
						<path d="M15 3h11l2 16-12 1z" />
						<path d="M15.6 17.6l13-1.2.6 4.8-13 1.2z" />
						<path d="M24.5 7.5l.8 9" stroke-width="2.4" />
						<circle cx="24.6" cy="8" r="1.3" fill="currentColor" />
					</svg>
					<span><b>Bisa digulung</b><small>Gulungan siku, tali + kancing</small></span>
				</button>
			</div>
			{#if uniformStore.state.sleeveStyle === 'gulung'}
				<p class="callout">
					Tali gulung lengan tidak tercantum di katalog. Konfirmasikan rincian harga ke admin sebelum order.
				</p>
			{/if}
		</div>
	{/if}

	<!-- Opsi Saku Dada -->
	{#if uniformStore.currentProduct.pockets}
		{@const one = (uniformStore.state.pocketCount[uniformStore.state.product] ?? 2) === 1}
		<div class="sec">
			<h3 class="lbl">Saku dada</h3>
			<div class="pat-grid">
				<button
					type="button"
					class="pat"
					aria-pressed={!one}
					onclick={() => uniformStore.setPocketCount(2)}
				>
					<svg viewBox="0 0 46 40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true">
						<path d="M15 4h16l3 10v22H12V14z" />
						<path d="M23 6v30" stroke-width="1" />
						<path d="M15 15h6v7h-6zM25 15h6v7h-6z" fill="currentColor" fill-opacity=".25" />
					</svg>
					<span><b>2 saku</b><small>Seperti katalog</small></span>
				</button>
				<button
					type="button"
					class="pat"
					aria-pressed={one}
					onclick={() => uniformStore.setPocketCount(1)}
				>
					<svg viewBox="0 0 46 40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true">
						<path d="M15 4h16l3 10v22H12V14z" />
						<path d="M23 6v30" stroke-width="1" />
						<path d="M25 15h6v7h-6z" fill="currentColor" fill-opacity=".25" />
					</svg>
					<span><b>1 saku</b><small>Dada kiri saja</small></span>
				</button>
			</div>
		</div>
	{/if}

	<!-- Opsi Rompi -->
	{#if uniformStore.currentProduct.cargo}
		<div class="sec">
			<h3 class="lbl">Atribut rompi</h3>
			<label class="chk">
				<input
					type="checkbox"
					checked={uniformStore.state.vestFlag}
					onchange={(e) => uniformStore.setVestFlag(e.currentTarget.checked)}
				/>
				<span>Patch bendera Merah Putih di dada kanan</span>
			</label>
			<p class="note">
				Fitur bawaan rompi: kerah berdiri, resleting depan, furing dalam, saku resleting dada, 2 saku kargo bertutup. Logo instansi dan teks diunggah di tab Logo.
			</p>
		</div>
	{/if}

	<!-- Pilihan Bahan -->
	<div class="sec">
		<h3 class="lbl">Pilihan Bahan</h3>
		<div class="mats">
			{#each uniformStore.currentProduct.materials as m}
				{@const selected = m.id === uniformStore.currentMaterial.id}
				{@const swatchBg = weaveSwatch(m.weave, uniformStore.look.body)}
				<button
					type="button"
					class="mat"
					aria-pressed={selected}
					onclick={() => uniformStore.setMaterial(m.id)}
				>
					<span class="sw" style="background-image: url({swatchBg})"></span>
					<span class="mat-name">
						{m.name}
						<small>{WEAVE_LABEL[m.weave] || m.weave}</small>
					</span>
					<span class="mat-price">
						{#if m.promo != null}
							<s>{fmt(m.list)}</s>
							<b>{fmt(m.promo)}</b>
						{:else}
							<b>Menyusul</b>
						{/if}
					</span>
				</button>
			{/each}
		</div>
	</div>

	<!-- Sudah Termasuk -->
	<div class="sec">
		<h3 class="lbl">Sudah termasuk</h3>
		{#if uniformStore.currentProduct.includes.length}
			<ul class="incl">
				{#each uniformStore.currentProduct.includes as item}
					<li>
						{@html CHECK_ICON}
						<span>{item}</span>
					</li>
				{/each}
			</ul>
			<p class="note">
				Minimal order <b>{uniformStore.currentProduct.minOrder ? `${uniformStore.currentProduct.minOrder} pcs` : 'menyusul'}</b>.
				Harga coret = price list normal, harga tebal = harga promo per pcs.
			</p>
		{:else if uniformStore.currentProduct.note}
			<p class="callout">{uniformStore.currentProduct.note}</p>
		{/if}
	</div>
</div>

<style>
	.tabpanel {
		padding: 20px 20px 28px;
		display: grid;
		gap: 26px;
	}

	.sec {
		display: grid;
		gap: 12px;
		min-width: 0;
	}

	.h {
		margin: 0;
		font: 700 24px/1 var(--f-display, sans-serif);
		text-transform: uppercase;
		letter-spacing: 0.01em;
		text-wrap: balance;
		color: var(--ink, #17202a);
	}

	.lbl {
		margin: 0;
		font: 600 12px/1.2 var(--f-body, sans-serif);
		text-transform: uppercase;
		letter-spacing: 0.09em;
		color: var(--ink-3, #74808b);
	}

	.note {
		margin: 0;
		font-size: 13px;
		color: var(--ink-2, #4d5a66);
	}

	.note b {
		color: var(--ink, #17202a);
	}

	.callout {
		margin: 0;
		padding: 10px 12px;
		border-radius: 10px;
		background: var(--warn-bg, #fbe6d3);
		color: var(--warn, #9c4507);
		font-size: 13px;
	}

	.prod-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
	}

	.prod {
		display: grid;
		gap: 2px;
		justify-items: start;
		text-align: left;
		padding: 12px;
		border-radius: 12px;
		border: 1px solid var(--line, #d2d9de);
		background: var(--sheet, #ffffff);
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.prod :global(svg) {
		width: 40px;
		height: 40px;
		color: var(--ink-2, #4d5a66);
		margin-bottom: 4px;
	}

	.prod-name {
		font: 700 16px/1.1 var(--f-display, sans-serif);
		text-transform: uppercase;
		letter-spacing: 0.02em;
		color: var(--ink, #17202a);
	}

	.prod-meta {
		font-size: 12.5px;
		color: var(--ink-2, #4d5a66);
	}

	.prod-meta :global(b) {
		font: 500 12.5px var(--f-mono, monospace);
		color: var(--ink, #17202a);
	}

	.prod-min {
		font: 500 11px/1.3 var(--f-mono, monospace);
		color: var(--ink-3, #74808b);
	}

	.prod:hover {
		border-color: var(--ink-3, #74808b);
	}

	.prod[aria-pressed='true'] {
		border-color: var(--ink, #17202a);
		box-shadow: inset 0 0 0 1px var(--ink, #17202a);
		background: var(--sheet-2, #f0f3f5);
	}

	.prod[aria-pressed='true'] :global(svg) {
		color: var(--ink, #17202a);
	}

	.pat-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px;
	}

	.pat {
		display: grid;
		grid-template-columns: 46px minmax(0, 1fr);
		gap: 10px;
		align-items: center;
		text-align: left;
		padding: 8px 10px 8px 8px;
		border-radius: 12px;
		border: 1px solid var(--line, #d2d9de);
		background: var(--sheet, #ffffff);
		cursor: pointer;
	}

	.pat svg {
		width: 46px;
		height: 40px;
	}

	.pat b {
		display: block;
		font-size: 13.5px;
		line-height: 1.2;
		color: var(--ink, #17202a);
	}

	.pat small {
		display: block;
		font-size: 12px;
		color: var(--ink-3, #74808b);
		line-height: 1.25;
	}

	.pat[aria-pressed='true'] {
		border-color: var(--ink, #17202a);
		box-shadow: inset 0 0 0 1px var(--ink, #17202a);
		background: var(--sheet-2, #f0f3f5);
	}

	.chk {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font-size: 14px;
		color: var(--ink, #17202a);
		cursor: pointer;
	}

	.chk input {
		width: 17px;
		height: 17px;
		accent-color: var(--ink, #17202a);
		margin: 0;
	}

	.mats {
		display: grid;
		gap: 8px;
	}

	.mat {
		display: grid;
		grid-template-columns: 44px minmax(0, 1fr) auto;
		align-items: center;
		gap: 12px;
		padding: 9px 12px 9px 9px;
		text-align: left;
		border-radius: 12px;
		border: 1px solid var(--line, #d2d9de);
		background: var(--sheet, #ffffff);
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.mat .sw {
		width: 44px;
		height: 44px;
		border-radius: 8px;
		background-size: cover;
		border: 1px solid var(--line, #d2d9de);
	}

	.mat-name {
		font-weight: 600;
		line-height: 1.25;
		color: var(--ink, #17202a);
	}

	.mat-name small {
		display: block;
		font-weight: 400;
		font-size: 12.5px;
		color: var(--ink-3, #74808b);
	}

	.mat-price {
		display: grid;
		justify-items: end;
		font: 500 14px/1.25 var(--f-mono, monospace);
		font-variant-numeric: tabular-nums;
		color: var(--ink, #17202a);
	}

	.mat-price s {
		font-size: 11.5px;
		color: var(--ink-3, #74808b);
	}

	.mat:hover {
		border-color: var(--ink-3, #74808b);
	}

	.mat[aria-pressed='true'] {
		border-color: var(--ink, #17202a);
		box-shadow: inset 0 0 0 1px var(--ink, #17202a);
		background: var(--sheet-2, #f0f3f5);
	}

	.incl {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 7px;
	}

	.incl li {
		display: grid;
		grid-template-columns: 18px 1fr;
		gap: 8px;
		align-items: start;
		font-size: 14px;
		color: var(--ink, #17202a);
	}

	.incl :global(svg) {
		width: 18px;
		height: 18px;
		margin-top: 2px;
		color: var(--ok, #1b7a45);
	}
</style>
