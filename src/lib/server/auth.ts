/** Login admin toko (Better Auth, email + kata sandi). Pembeli tidak punya akun. */
import { getRequestEvent } from '$app/server';
import { BETTER_AUTH_SECRET, BETTER_AUTH_URL, ORIGIN } from '$app/env/private';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getDb } from './db';
import { account, session, user, verification } from './db/schema';

function createAuth() {
	return betterAuth({
		appName: 'Toko Indah Expres',
		baseURL: ORIGIN || BETTER_AUTH_URL || undefined,
		secret: BETTER_AUTH_SECRET,
		database: drizzleAdapter(getDb(), {
			provider: 'sqlite',
			schema: { user, session, account, verification }
		}),
		emailAndPassword: {
			enabled: true,
			// Admin dibuat dari env (ADMIN_EMAIL/ADMIN_PASSWORD), tidak ada pendaftaran publik
			disableSignUp: true,
			minPasswordLength: 8
		},
		session: { expiresIn: 60 * 60 * 24 * 7 },
		// harus plugin terakhir
		plugins: [sveltekitCookies(getRequestEvent)]
	});
}

let auth: ReturnType<typeof createAuth> | undefined;

/** Dibuat saat pertama dipakai supaya database tidak dibuka saat build */
export function getAuth() {
	return (auth ??= createAuth());
}

/** Buat admin pertama dari env bila belum ada akun admin sama sekali */
export async function ensureAdmin(email: string | undefined, password: string | undefined) {
	if (!email || !password) return false;
	const existing = getDb().select({ id: user.id }).from(user).limit(1).get();
	if (existing) return false;
	const ctx = await getAuth().$context;
	const hash = await ctx.password.hash(password);
	const created = await ctx.internalAdapter.createUser(
		{ email: email.trim().toLowerCase(), name: 'Admin Toko', emailVerified: true },
		{ method: 'email-password' }
	);
	await ctx.internalAdapter.linkAccount({
		userId: created.id,
		providerId: 'credential',
		accountId: created.id,
		password: hash
	});
	return true;
}
