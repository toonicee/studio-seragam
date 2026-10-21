import { getDb } from '$lib/server/db';
import { listRefunds } from '$lib/server/shop/admin';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => ({ rows: listRefunds(getDb()), origin: url.origin });
