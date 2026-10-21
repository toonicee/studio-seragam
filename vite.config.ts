import adapter from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [
		// Tailwind hanya dipakai toko (/shop) lewat src/shop.css; konfigurator tetap memakai app.css
		tailwindcss(),
		sveltekit({
			alias: {
				'$lib': 'src/lib',
				'$lib/*': 'src/lib/*'
			},
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			// Toko + konfigurator berjalan sebagai server Node di VPS (Docker), lihat Dockerfile
			adapter: adapter()
		})
	],
	test: {
		include: ['src/**/*.test.ts'],
		environment: 'node'
	}
});
