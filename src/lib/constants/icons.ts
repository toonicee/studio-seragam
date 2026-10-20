import type { ProductKey } from '$lib/types/uniform';

/** Ikon garis tiap model seragam (dipakai di tab Model & halaman katalog) */
export const PRODUCT_ICONS: Record<ProductKey, string> = {
	kemeja: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M17 6 10 9 4 17l5 4 4-4v25h22V17l4 4 5-4-6-8-7-3-7 6z"/><path d="M17 6l7 6-4 4zM31 6l-7 6 4 4zM24 12v30"/><path d="M15 23h6v5h-6zM27 23h6v5h-6z" stroke-width="1.2"/></svg>`,
	kemejaPanjang: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M17 6 10 9 6 24l-1 16 5 1 3-17v18h22V24l3 17 5-1-1-16-4-15-7-3-7 6z"/><path d="M17 6l7 6-4 4zM31 6l-7 6 4 4zM24 12v30"/><path d="M5 36h5M38 36h5" stroke-width="1.2"/></svg>`,
	kaos: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M17 6 10 9 4 17l5 4 4-4v25h22V17l4 4 5-4-6-8-7-3c-2 3-12 3-14 0z"/><path d="M18 7.5c2.5 2.5 9.5 2.5 12 0" stroke-width="1.2"/></svg>`,
	rompi: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M17 4 12 8v7c2.2 2.5 2.2 6.5 0 9v18h11.6V8.5L20 4zM31 4l5 4v7c-2.2 2.5-2.2 6.5 0 9v18H24.4V8.5L28 4z"/><path d="M14 31h7v6h-7zM27 31h7v6h-7z" stroke-width="1.2"/><path d="M15 17h6M27 17h6" stroke-width="2"/></svg>`,
	polo: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M17 6 10 9 4 17l5 4 4-4v25h22V17l4 4 5-4-6-8-7-3-7 4z"/><path d="M17 6l7 4-3 4zM31 6l-7 4 3 4zM24 10v10"/><circle cx="24" cy="14" r=".8" fill="currentColor"/><circle cx="24" cy="18" r=".8" fill="currentColor"/></svg>`
};
