// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { Session, User } from 'better-auth';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			/** Admin toko yang sedang masuk (hanya diisi untuk /shop/admin dan /api/auth) */
			user: User | null;
			session: Session | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

// Swiper Element (web component) dipakai untuk slider toko
declare module 'svelte/elements' {
	interface SvelteHTMLElements {
		'swiper-container': HTMLAttributes<HTMLElement> & Record<string, unknown>;
		'swiper-slide': HTMLAttributes<HTMLElement> & Record<string, unknown>;
	}
}

export {};
