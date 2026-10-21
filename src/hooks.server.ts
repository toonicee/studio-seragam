import { building } from '$app/env';
import type { Handle, ServerInit } from '@sveltejs/kit/hooks';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { getAuth } from '$lib/server/auth';
import { bootstrap } from '$lib/server/shop/bootstrap';

export const init: ServerInit = async () => {
	if (!building) await bootstrap();
};

const isAdminPath = (p: string) => p === '/shop/admin' || p.startsWith('/shop/admin/');
const isLoginPath = (p: string) => p === '/shop/admin/login' || p === '/shop/admin/logout';

export const handle: Handle = async ({ event, resolve }) => {
	const path = event.url.pathname;
	event.locals.user = null;
	event.locals.session = null;

	if (building || !(isAdminPath(path) || path.startsWith('/api/auth'))) {
		return resolve(event);
	}

	const auth = getAuth();
	const current = await auth.api.getSession({ headers: event.request.headers });
	event.locals.user = current?.user ?? null;
	event.locals.session = current?.session ?? null;

	// Penjagaan di sini (bukan di layout load) supaya form action admin juga terlindungi
	if (isAdminPath(path) && !isLoginPath(path) && !event.locals.user) {
		if (event.request.method === 'GET' || event.request.method === 'HEAD') {
			const next = encodeURIComponent(path + event.url.search);
			return new Response(null, { status: 303, headers: { location: `/shop/admin/login?next=${next}` } });
		}
		return new Response('Silakan masuk sebagai admin.', { status: 401 });
	}

	return svelteKitHandler({ event, resolve, auth, building });
};
