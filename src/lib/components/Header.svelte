<script lang="ts">
	import { CLIENT_CONFIG } from '$lib/client-config';

	let {
		onOpenMockup,
		onOpenOrders,
		onToggleTheme,
		isDark
	}: {
		onOpenMockup: () => void;
		onOpenOrders: () => void;
		onToggleTheme: () => void;
		isDark: boolean;
	} = $props();
</script>

<header class="app-header">
	<div class="brand">
		<!-- Logo Indah Express -->
		<a href="/katalog" class="client-logo" title="Lihat Katalog Seragam Indah Expres">
			<img src={CLIENT_CONFIG.markUrl} alt="Indah Expres" width="42" height="42" />
		</a>
		<div class="brand-text">
			<h1 class="brand-title">Studio Seragam</h1>
			<span class="brand-subtitle">Indah Expres × 3D Konfigurator</span>
		</div>
	</div>

	<div class="header-actions">
		<!-- Tombol Katalog -->
		<a href="/katalog" class="btn-header katalog" title="Lihat katalog seragam lengkap Indah Expres">
			<svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
				<path fill-rule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clip-rule="evenodd" />
			</svg>
			<span>Katalog</span>
		</a>

		<!-- Toko merchandise: reload penuh supaya gaya toko (Tailwind) tidak bercampur dengan konfigurator -->
		<a href="/shop" data-sveltekit-reload class="btn-header" title="Toko merchandise Indah Expres (pre-order)">
			<svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
				<path fill-rule="evenodd" d="M6 5v1H4.667a1.75 1.75 0 00-1.743 1.598l-.826 9.5A1.75 1.75 0 003.84 19H16.16a1.75 1.75 0 001.743-1.902l-.826-9.5A1.75 1.75 0 0015.333 6H14V5a4 4 0 00-8 0zm4-2.5A2.5 2.5 0 007.5 5v1h5V5A2.5 2.5 0 0010 2.5zM7.5 10a2.5 2.5 0 005 0V8.75a.75.75 0 011.5 0V10a4 4 0 01-8 0V8.75a.75.75 0 011.5 0V10z" clip-rule="evenodd" />
			</svg>
			<span>Merchandise</span>
		</a>

		<button
			type="button"
			class="btn-header"
			onclick={onOpenOrders}
			title="Lihat riwayat pesanan yang sudah dikirim"
		>
			<svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
				<path
					fill-rule="evenodd"
					d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 01-1-1V3.5L14.5 8H11z"
					clip-rule="evenodd"
				/>
			</svg>
			<span>Pesanan</span>
		</button>

		<button
			type="button"
			class="btn-header primary"
			onclick={onOpenMockup}
			title="Simpan desain atau buat penawaran order"
		>
			<svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
				<path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
			</svg>
			<span>Simpan & Bagikan</span>
		</button>

		<button
			type="button"
			class="theme-toggle"
			onclick={onToggleTheme}
			aria-label="Ganti mode gelap/terang"
			title={isDark ? 'Beralih ke tema terang' : 'Beralih ke tema gelap'}
		>
			{#if isDark}
				<!-- Sun icon -->
				<svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
					<path
						fill-rule="evenodd"
						d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
						clip-rule="evenodd"
					/>
				</svg>
			{:else}
				<!-- Moon icon -->
				<svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
					<path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
				</svg>
			{/if}
		</button>
	</div>
</header>

<style>
	.app-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 10px 16px;
		background: var(--sheet, #ffffff);
		border: 1px solid var(--line, #d2d9de);
		border-radius: 14px;
		margin-bottom: 12px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 14px;
	}

	.client-logo {
		display: grid;
		place-items: center;
		text-decoration: none;
		width: 42px;
		height: 42px;
		border-radius: 50%;
		transition: transform 0.2s ease, box-shadow 0.2s ease;
		box-shadow: 0 2px 8px rgba(227, 90, 18, 0.3);
	}

	.client-logo img {
		display: block;
		width: 100%;
		height: 100%;
	}

	.client-logo:hover {
		transform: scale(1.08);
		box-shadow: 0 4px 16px rgba(227, 90, 18, 0.45);
	}

	.brand-text {
		display: flex;
		flex-direction: column;
	}

	.brand-title {
		margin: 0;
		font-family: var(--f-display, sans-serif);
		font-size: 20px;
		font-weight: 700;
		line-height: 1.1;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		color: var(--ink, #17202a);
	}

	.brand-subtitle {
		font-size: 11px;
		color: #E35A12;
		font-family: var(--f-mono, monospace);
		letter-spacing: 0.04em;
		font-weight: 600;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.btn-header {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 7px 12px;
		border-radius: 9px;
		border: 1px solid var(--line, #d2d9de);
		background: var(--sheet, #ffffff);
		color: var(--ink, #17202a);
		font-size: 13px;
		font-weight: 600;
		text-decoration: none;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.btn-header:hover {
		background: var(--sheet-2, #f0f3f5);
		border-color: var(--ink-3, #74808b);
	}

	.btn-header.primary {
		background: var(--ink, #17202a);
		color: var(--sheet, #ffffff);
		border-color: var(--ink, #17202a);
	}

	.btn-header.primary:hover {
		opacity: 0.9;
	}

	.btn-header.katalog {
		background: #E35A12;
		color: #ffffff;
		border-color: #E35A12;
		text-decoration: none;
	}

	.btn-header.katalog:hover {
		background: #c94e0e;
		border-color: #c94e0e;
	}

	.theme-toggle {
		display: inline-grid;
		place-items: center;
		width: 36px;
		height: 36px;
		border-radius: 9px;
		border: 1px solid var(--line, #d2d9de);
		background: var(--sheet, #ffffff);
		color: var(--ink, #17202a);
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.theme-toggle:hover {
		background: var(--sheet-2, #f0f3f5);
	}

	@media (max-width: 900px) {
		.app-header {
			padding: 6px 8px 6px 10px;
			margin-bottom: 8px;
		}
	}

	@media (max-width: 600px) {
		.brand {
			gap: 10px;
		}

		.client-logo,
		.client-logo img {
			width: 34px;
			height: 34px;
		}

		.brand-title {
			font-size: 18px;
		}

		.brand-subtitle {
			display: none;
		}

		.header-actions {
			gap: 6px;
		}

		.btn-header span {
			display: none;
		}

		/* Tap target minimal 40px */
		.btn-header,
		.theme-toggle {
			width: 40px;
			height: 40px;
			padding: 0;
			justify-content: center;
		}
	}
</style>
