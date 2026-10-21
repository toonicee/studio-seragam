import { error } from '@sveltejs/kit';

/** Pertahanan kedua setelah hooks.server.ts: setiap action admin wajib sesi admin */
export function requireAdmin(locals: App.Locals) {
	if (!locals.user) error(401, 'Silakan masuk sebagai admin.');
	return locals.user;
}
