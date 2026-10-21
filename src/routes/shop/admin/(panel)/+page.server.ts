import { getDb } from '$lib/server/db';
import { dashboardStats } from '$lib/server/shop/admin';
import { runJob } from '$lib/server/shop/bootstrap';
import { requireAdmin } from '$lib/server/shop/guard';
import { getSettings } from '$lib/server/shop/settings';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const db = getDb();
	const now = Date.now();
	const s = getSettings(db);
	return { stats: dashboardStats(db, now), lastJobRun: s.lastJobRun, qrisReady: !!s.qrisImage };
};

export const actions: Actions = {
	runJob: async ({ locals }) => {
		requireAdmin(locals);
		const r = runJob('admin');
		return { job: r };
	}
};
