import { redirect } from '@sveltejs/kit';
import { getAuth } from '$lib/server/auth';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (locals.user) await getAuth().api.signOut({ headers: request.headers });
	redirect(303, '/shop/admin/login');
};
