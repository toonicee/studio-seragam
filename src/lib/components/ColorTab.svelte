<script lang="ts">
	import { uniformStore } from '$lib/stores/uniform.svelte';
	import {
		PATTERN_GROUPS,
		VEST_GROUPS,
		patternsFor,
		patternOf,
		SWATCHES,
		BUTTONS,
		SAMPLE_LOOKS,
		SILVER,
		colorName
	} from '$lib/constants/catalog';

	const PLUS_ICON = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M8 3v10M3 8h10"/></svg>`;

	function getPatternSvg(id: string) {
		const L = uniformStore.look;
		const b = L.body;
		const a = L.accent;
		const a2 = L.accent2 || '#c8ccce';
		const line = 'rgba(0,0,0,.28)';
		const p = patternOf(id);
		const sl = p.sleeve ? a : b;
		const trim = p.trim ? a : b;
		const pk = p.pocket ? a : b;
		const fl = trim;

		const curveSide = `<path d="M12.3 16c1.2 8 2.6 15 5.6 22H12zM33.7 16c-1.2 8-2.6 15-5.6 22H34z" fill="${a}"/>`;
		const curveRaglan = `<path d="M14 5h5c-1.6 4.6-3.8 8.3-6.6 11H12zM32 5h-5c1.6 4.6 3.8 8.3 6.6 11h.4z" fill="${a}"/>`;

		const overlayMap: Record<string, string> = {
			yoke: `<path d="M14 5h18l1 7H13z" fill="${a}"/>`,
			raglan: `<path d="M14 5h5.5L12.4 16H12zM32 5h-5.5l7.1 11h.4z" fill="${a}"/>`,
			side: `<path d="M12.4 16h3v22h-3zM30.6 16h3v22h-3z" fill="${a}"/>`,
			sideCurve: curveSide,
			sport2: curveRaglan + curveSide,
			sport3:
				curveRaglan +
				`<path d="M19.6 5.6c-1.7 4.6-4 8.3-6.9 11M26.4 5.6c1.7 4.6 4 8.3 6.9 11" stroke="${a2}" stroke-width="1.7" fill="none"/>` +
				curveSide,
			bottom: `<path d="M12 29h22v9H12z" fill="${a}"/>`,
			upper: `<path d="M14 5h18l2 11v5H12v-5z" fill="${a}"/>`,
			upperReflect: `<path d="M14 5h18l2 11v5H12v-5z" fill="${a}"/><path d="M12 20.4h22v2H12z" fill="${SILVER}"/>`,
			vest: `<path d="M13.6 6h1.6v25h-1.6zM30.8 6h1.6v25h-1.6zM12 30.6h22v2H12z" fill="${SILVER}"/>`,
			stripe: `<path d="M12 24h22v2.4H12z" fill="${a}"/>`,
			piping: `<path d="M13 11.5h20" stroke="${a}" stroke-width="1"/>`,
			reflect: `<path d="M12 24h22v2H12zM12 31h22v2H12z" fill="${SILVER}"/>`
		};
		const overlay = overlayMap[p.body || ''] || '';

		const sleeveBand =
			p.sleeveStripe === 'accent'
				? `<path d="M5.2 17.5l6.3 1.3-.3 1.6-6.4-1.3zM40.8 17.5l-6.3 1.3.3 1.6 6.4-1.3z" fill="${a}"/>`
				: p.sleeveStripe === 'reflect'
					? `<path d="M5.2 17.5l6.3 1.3-.3 1.6-6.4-1.3zM40.8 17.5l-6.3 1.3.3 1.6 6.4-1.3z" fill="${SILVER}"/>`
					: p.sleeveStripe === 'double'
						? `<path d="M5.1 18l6.4 1.3M4.8 19.8l6.4 1.3M40.9 18l-6.4 1.3M41.2 19.8l-6.4 1.3" stroke="${a}" stroke-width=".8"/>`
						: p.sleeveStripe === 'pipe'
							? `<path d="M5 19.5l6.4 1.2M41 19.5l-6.4 1.2" stroke="${a}" stroke-width=".8"/>`
							: p.sleeveSplit
								? `<path d="M14 5 7 9 5.2 17l6.5-.6L13 9.5zM32 5l7 4 1.8 8-6.5-.6L33 9.5z" fill="${a}"/>`
								: '';

		const pipe = p.body === 'piping' ? ` stroke="${a}" stroke-width=".9"` : ` stroke="${line}" stroke-width=".5"`;

		return `<svg viewBox="0 0 46 40" aria-hidden="true">
			<path d="M14 5 7 9 4 22l7 1 3-6z" fill="${sl}" stroke="${line}" stroke-width=".8"/>
			<path d="M32 5l7 4 3 13-7 1-3-6z" fill="${sl}" stroke="${line}" stroke-width=".8"/>
			${sleeveBand}
			<path d="M14 5h18l2 11v22H12V16z" fill="${b}" stroke="${line}" stroke-width=".8"/>
			${overlay}
			${p.placket ? `<path d="M22 10h2v28h-2z" fill="${a}"/>` : `<path d="M23 10v28" stroke="${line}" stroke-width=".5"/>`}
			<path d="M15.5 17h5v5h-5zM25.5 17h5v5h-5z" fill="${pk}"${pipe}/>
			<path d="M15.3 16.2h5.4v2h-5.4zM25.3 16.2h5.4v2h-5.4z" fill="${fl}" stroke="${line}" stroke-width=".4"/>
			<path d="M18 5l5 5 5-5z" fill="${trim}" stroke="${line}" stroke-width=".8"/>
			${p.epaulet ? `<path d="M17.4 5.6 9.6 8.6M28.6 5.6l7.8 3" stroke="${a}" stroke-width="2.1" stroke-linecap="round"/>` : ''}
		</svg>`;
	}

	function applySampleLook() {
		const curPattern = uniformStore.look.pattern;
		const sample = SAMPLE_LOOKS[curPattern];
		if (!sample) return;
		if (sample.body) uniformStore.setColor('body', sample.body);
		if (sample.accent) uniformStore.setColor('accent', sample.accent);
		if (sample.accent2) uniformStore.setColor('accent2', sample.accent2);
		if (sample.lining) uniformStore.setColor('lining', sample.lining);
		uniformStore.showToast('Warna contoh diterapkan');
	}
</script>

<div class="tabpanel">
	<h2 class="h">Warna</h2>

	<!-- Warna Badan -->
	<div class="sec">
		<div class="color-row">
			<h3 class="lbl">Warna badan</h3>
			<span class="color-name">{colorName(uniformStore.look.body)}</span>
		</div>
		<div class="swatches">
			{#each SWATCHES as [name, hex]}
				<button
					type="button"
					class="sw-btn"
					style="--c: {hex}"
					aria-pressed={uniformStore.look.body.toLowerCase() === hex.toLowerCase()}
					aria-label={name}
					title={name}
					onclick={() => uniformStore.setColor('body', hex)}
				></button>
			{/each}
			<label class="sw-custom" title="Warna lain">
				{@html PLUS_ICON}
				<input
					type="color"
					value={uniformStore.look.body}
					aria-label="Pilih warna badan lain"
					oninput={(e) => uniformStore.setColor('body', e.currentTarget.value)}
				/>
			</label>
		</div>
	</div>

	<!-- Warna Aksen (jika bukan pola polos) -->
	{#if uniformStore.currentProduct.logoOnly}
		<p class="sub note">{uniformStore.currentProduct.name} dibuat polos satu warna. Desainnya cukup unggah logo di langkah <b>Logo</b>.</p>
	{:else if uniformStore.look.pattern === 'polos'}
		<p class="sub note">Ingin lengan/kerah beda warna? Pilih <b>pola warna</b> di bawah, lalu warna aksen akan muncul di sini.</p>
	{:else}
		<div class="sec">
			<div class="color-row">
				<h3 class="lbl">Warna aksen (lengan & kerah)</h3>
				<span class="color-name">{colorName(uniformStore.look.accent)}</span>
			</div>
			<div class="swatches">
				{#each SWATCHES as [name, hex]}
					<button
						type="button"
						class="sw-btn"
						style="--c: {hex}"
						aria-pressed={uniformStore.look.accent.toLowerCase() === hex.toLowerCase()}
						aria-label={name}
						title={name}
						onclick={() => uniformStore.setColor('accent', hex)}
					></button>
				{/each}
				<label class="sw-custom" title="Warna lain">
					{@html PLUS_ICON}
					<input
						type="color"
						value={uniformStore.look.accent}
						aria-label="Pilih warna aksen lain"
						oninput={(e) => uniformStore.setColor('accent', e.currentTarget.value)}
					/>
				</label>
			</div>
		</div>
	{/if}

	<!-- Warna List (jika pola memiliki c3) -->
	{#if patternOf(uniformStore.look.pattern).c3}
		<div class="sec">
			<div class="color-row">
				<h3 class="lbl">Warna list (ketiga)</h3>
				<span class="color-name">{colorName(uniformStore.look.accent2 || '#c8ccce')}</span>
			</div>
			<div class="swatches">
				{#each SWATCHES as [name, hex]}
					<button
						type="button"
						class="sw-btn"
						style="--c: {hex}"
						aria-pressed={(uniformStore.look.accent2 || '#c8ccce').toLowerCase() === hex.toLowerCase()}
						aria-label={name}
						title={name}
						onclick={() => uniformStore.setColor('accent2', hex)}
					></button>
				{/each}
				<label class="sw-custom" title="Warna lain">
					{@html PLUS_ICON}
					<input
						type="color"
						value={uniformStore.look.accent2 || '#c8ccce'}
						aria-label="Pilih warna list lain"
						oninput={(e) => uniformStore.setColor('accent2', e.currentTarget.value)}
					/>
				</label>
			</div>
		</div>
	{/if}

	<!-- Warna Furing Rompi -->
	{#if uniformStore.currentProduct.collar === 'stand'}
		<div class="sec">
			<div class="color-row">
				<h3 class="lbl">Warna furing dalam</h3>
				<span class="color-name">{colorName(uniformStore.look.lining || '#1c1d20')}</span>
			</div>
			<div class="swatches">
				{#each SWATCHES as [name, hex]}
					<button
						type="button"
						class="sw-btn"
						style="--c: {hex}"
						aria-pressed={(uniformStore.look.lining || '#1c1d20').toLowerCase() === hex.toLowerCase()}
						aria-label={name}
						title={name}
						onclick={() => uniformStore.setColor('lining', hex)}
					></button>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Warna Kancing -->
	{#if uniformStore.currentProduct.buttons}
		<div class="sec">
			<div class="color-row">
				<h3 class="lbl">Warna kancing</h3>
				<span class="color-name">{colorName(uniformStore.look.button)}</span>
			</div>
			<div class="swatches sm">
				{#each BUTTONS as [name, hex]}
					{@const active = uniformStore.look.button.toLowerCase() === hex.toLowerCase()}
					{@const isAuto = hex === 'auto'}
					<button
						type="button"
						class="sw-btn {isAuto ? 'sw-auto' : ''}"
						style="--c: {hex === 'accent' ? uniformStore.look.accent : hex}"
						aria-pressed={active}
						aria-label={name}
						title={name}
						onclick={() => uniformStore.setColor('button', hex)}
					></button>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Pola Warna (tidak ada untuk kaos & polo) -->
	{#if !uniformStore.currentProduct.logoOnly}
		<div class="sec">
			<h2 class="h">Pola warna</h2>
			<p class="sub">Bagian mana yang memakai warna aksen</p>
			{#each (uniformStore.currentProduct.sleeve === 'none' ? VEST_GROUPS : PATTERN_GROUPS) as [g, title]}
				<h3 class="lbl pat-group">{title}</h3>
				<div class="pat-grid">
					{#each patternsFor(uniformStore.state.product, g) as p}
						{@const active = p.id === uniformStore.look.pattern}
						<button
							type="button"
							class="pat"
							aria-pressed={active}
							onclick={() => uniformStore.setPattern(p.id)}
						>
							{@html getPatternSvg(p.id)}
							<span>
								<b>{p.name}</b>
								<small>{p.desc}</small>
							</span>
						</button>
					{/each}
				</div>
			{/each}

			{#if SAMPLE_LOOKS[uniformStore.look.pattern]}
				<button
					type="button"
					class="btn-line btn-sm"
					onclick={applySampleLook}
					style="justify-self: start"
				>
					Pakai warna seperti contoh
				</button>
			{/if}
		</div>
	{/if}

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

	.pat-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px;
	}

	.pat-group {
		margin-top: 4px;
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
		transition: all 0.15s ease;
	}

	.pat :global(svg) {
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

	.swatches {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.sw-btn {
		position: relative;
		width: 30px;
		height: 30px;
		border-radius: 50%;
		padding: 0;
		border: 1px solid rgba(0, 0, 0, 0.18);
		background: var(--c);
		cursor: pointer;
		transition: transform 0.1s ease;
	}

	.sw-btn:hover {
		transform: scale(1.1);
	}

	.sw-btn[aria-pressed='true']::after {
		content: '';
		position: absolute;
		inset: -5px;
		border-radius: 50%;
		border: 2px solid var(--ink, #17202a);
	}

	.swatches.sm .sw-btn {
		width: 24px;
		height: 24px;
	}

	.sw-auto {
		background: conic-gradient(#f4f4f0 0 50%, #1b2129 0 100%);
	}

	.sw-custom {
		display: inline-grid;
		place-items: center;
		width: 30px;
		height: 30px;
		border-radius: 50%;
		border: 1px dashed var(--ink-3, #74808b);
		position: relative;
		overflow: hidden;
		color: var(--ink-2, #4d5a66);
		cursor: pointer;
	}

	.sw-custom input {
		position: absolute;
		inset: -6px;
		width: 44px;
		height: 44px;
		opacity: 0;
		cursor: pointer;
	}

	.sw-custom :global(svg) {
		width: 14px;
		height: 14px;
		pointer-events: none;
	}

	.color-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	}

	.color-name {
		font: 500 12.5px var(--f-mono, monospace);
		color: var(--ink-2, #4d5a66);
	}

	.btn-line {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 10px 16px;
		border-radius: 10px;
		font-weight: 600;
		font-size: 14px;
		line-height: 1.1;
		white-space: nowrap;
		background: var(--sheet, #ffffff);
		color: var(--ink, #17202a);
		border: 1px solid var(--line, #d2d9de);
		cursor: pointer;
	}

	.btn-line:hover {
		border-color: var(--ink-3, #74808b);
	}

	.btn-sm {
		padding: 7px 12px;
		font-size: 13px;
	}

	.sub {
		margin: -6px 0 0;
		font-size: 13px;
		color: var(--ink-3, #74808b);
	}

	.sub.note {
		margin: -8px 0 0;
		padding: 10px 12px;
		border-radius: 10px;
		background: var(--sheet-2, #f0f3f5);
		color: var(--ink-2, #4d5a66);
		line-height: 1.4;
	}

	/* Layar sentuh: target sentuh ≥ 40px */
	@media (pointer: coarse), (max-width: 600px) {
		.tabpanel {
			padding: 16px 16px 20px;
			gap: 22px;
		}

		.swatches {
			gap: 10px;
		}

		.sw-btn,
		.sw-custom {
			width: 40px;
			height: 40px;
		}

		.sw-btn:hover {
			transform: none;
		}

		.swatches.sm .sw-btn {
			width: 34px;
			height: 34px;
		}

		.sw-custom input {
			inset: -2px;
			width: 44px;
			height: 44px;
		}
	}

	@media (max-width: 600px) {
		.pat-grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}

		.pat b {
			font-size: 12.5px;
		}

		.pat {
			grid-template-columns: 1fr;
			justify-items: center;
			text-align: center;
			padding: 10px 6px 8px;
			gap: 4px;
		}

		.pat :global(svg) {
			width: 52px;
			height: 45px;
		}

		.pat small {
			display: none;
		}
	}
</style>
