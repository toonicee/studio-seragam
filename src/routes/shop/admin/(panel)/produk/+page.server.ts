import { getDb } from '$lib/server/db';
import { listProductsAdmin } from '$lib/server/shop/admin';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({ products: listProductsAdmin(getDb()) });
