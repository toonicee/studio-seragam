import * as THREE from 'three';
import { PRODUCTS, DEG, TAU, clamp, lerp, smooth } from '$lib/constants/catalog';
import type { ProductKey } from '$lib/types/uniform';

const sc = (c: number, n: number) => Math.sign(c) * Math.pow(Math.abs(c), 2 / n);

const phiCache = new Map<number, { phis: Float32Array; per: number }>();

export function phiTable(ratio: number, n: number) {
	const key = Math.round(ratio * 500) * 1000 + Math.round(n * 50);
	let tab = phiCache.get(key);
	if (tab) return tab;
	const M = 720,
		cum = new Float64Array(M + 1);
	let px = -1,
		pz = 0;
	for (let k = 1; k <= M; k++) {
		const ph = (k / M) * TAU;
		const x = -sc(Math.cos(ph), n),
			z = ratio * sc(Math.sin(ph), n);
		cum[k] = cum[k - 1] + Math.hypot(x - px, z - pz);
		px = x;
		pz = z;
	}
	const per = cum[M],
		K = 512,
		phis = new Float32Array(K + 1);
	let k = 0;
	for (let q = 0; q <= K; q++) {
		const target = (q / K) * per;
		while (k < M - 1 && cum[k + 1] < target) k++;
		const seg = cum[k + 1] - cum[k] || 1;
		phis[q] = ((k + clamp((target - cum[k]) / seg, 0, 1)) / M) * TAU;
	}
	tab = { phis, per };
	phiCache.set(key, tab);
	return tab;
}

export function phiOf(u: number, tab: { phis: Float32Array; per: number }) {
	u = ((u % 1) + 1) % 1;
	const f = u * 512,
		q = Math.min(511, Math.floor(f));
	return lerp(tab.phis[q], tab.phis[q + 1], f - q);
}

function cr(p0: number, p1: number, p2: number, p3: number, t: number) {
	const t2 = t * t,
		t3 = t2 * t;
	return (
		0.5 *
		(2 * p1 +
			(-p0 + p2) * t +
			(2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
			(-p0 + 3 * p1 - 3 * p2 + p3) * t3)
	);
}

export function buildProfile(pts: number[][]) {
	const N = 900,
		segs = pts.length - 1;
	const ys = new Float64Array(N + 1),
		as = new Float64Array(N + 1),
		bs = new Float64Array(N + 1),
		ns = new Float64Array(N + 1),
		L = new Float64Array(N + 1);
	const g = (j: number) => pts[clamp(j, 0, segs)];
	for (let k = 0; k <= N; k++) {
		const f = (k / N) * segs,
			i = Math.min(segs - 1, Math.floor(f)),
			t = f - i;
		ys[k] = cr(g(i - 1)[0], g(i)[0], g(i + 1)[0], g(i + 2)[0], t);
		as[k] = cr(g(i - 1)[1], g(i)[1], g(i + 1)[1], g(i + 2)[1], t);
		bs[k] = cr(g(i - 1)[2], g(i)[2], g(i + 1)[2], g(i + 2)[2], t);
		ns[k] = cr(g(i - 1)[3], g(i)[3], g(i + 1)[3], g(i + 2)[3], t);
		if (k > 0) {
			if (ys[k] <= ys[k - 1]) ys[k] = ys[k - 1] + 1e-6;
			L[k] = L[k - 1] + Math.hypot(ys[k] - ys[k - 1], bs[k] - bs[k - 1]);
		}
	}
	const total = L[N];
	const interp = (arr: Float64Array, t: number) => {
		const f = clamp(t, 0, 1) * N,
			k = Math.min(N - 1, Math.floor(f));
		return lerp(arr[k], arr[k + 1], f - k);
	};
	const inv = (arr: Float64Array, val: number) => {
		if (val <= arr[0]) return 0;
		if (val >= arr[N]) return 1;
		let lo = 0,
			hi = N;
		while (hi - lo > 1) {
			const mid = (lo + hi) >> 1;
			if (arr[mid] <= val) lo = mid;
			else hi = mid;
		}
		return (lo + (val - arr[lo]) / (arr[hi] - arr[lo] || 1)) / N;
	};
	return {
		total,
		at: (t: number, o: number[]) => {
			o[0] = interp(ys, t);
			o[1] = interp(as, t);
			o[2] = interp(bs, t);
			o[3] = interp(ns, t);
			return o;
		},
		vAt: (t: number) => interp(L, t) / total,
		tOfV: (v: number) => inv(L, v * total),
		tOfY: (y: number) => inv(ys, y)
	};
}

export interface TorsoConfig {
	pts: number[][];
	hemCurve: number;
	neckDropF: number;
	armhole: { yc: number; H: number; W: number } | null;
	neckDropB: number;
}

export function torsoConfig(pid: ProductKey): TorsoConfig {
	const P = PRODUCTS[pid];
	const crew = P.collar === 'crew',
		vest = P.collar === 'stand';
	const neckA = crew ? 0.172 : vest ? 0.162 : 0.152,
		neckB = crew ? 0.146 : vest ? 0.138 : 0.128;
	const bulk = vest ? 1.03 : 1;
	return {
		pts: [
			[-0.8, 0.432 * bulk, 0.25 * bulk, 2.4],
			[-0.55, 0.418 * bulk, 0.246 * bulk, 2.45],
			[-0.25, 0.398 * bulk, 0.244 * bulk, 2.5],
			[0.05, 0.402 * bulk, 0.252 * bulk, 2.5],
			[0.25, 0.418 * bulk, 0.254 * bulk, 2.5],
			[0.4, 0.44 * bulk, 0.244 * bulk, 2.45],
			[0.475, 0.446 * bulk, 0.226 * bulk, 2.35],
			[0.53, 0.41 * bulk, 0.2 * bulk, 2.25],
			[0.572, 0.336, 0.174, 2.12],
			[0.604, 0.256, 0.152, 2.05],
			[0.626, neckA + 0.03, neckB + 0.012, 2.0],
			[0.64, neckA, neckB, 2.0]
		],
		hemCurve: P.collar === 'shirt' ? 0.1 : P.collar === 'polo' ? 0.012 : vest ? 0.02 : 0,
		neckDropF: crew ? 0.08 : P.collar === 'polo' ? 0.065 : vest ? 0.03 : 0.072,
		armhole: vest ? { yc: 0.33, H: 0.235, W: 0.13 } : null,
		neckDropB: crew ? 0.014 : 0.006
	};
}

export interface TorsoObject {
	prof: ReturnType<typeof buildProfile>;
	cfg: TorsoConfig;
	tStart: (u: number) => number;
	tEnd: (u: number) => number;
	pos: (u: number, t: number, o: number[]) => number[];
	normal: (u: number, t: number, o: number[]) => number[];
	perimeterAt: (t: number) => number;
	px: (side: 'front' | 'back', s: number, y: number, W: number, H: number) => [number, number];
}

export function makeTorso(cfg: TorsoConfig): TorsoObject {
	const prof = buildProfile(cfg.pts);
	const pr = [0, 0, 0, 0],
		A = [0, 0, 0],
		B = [0, 0, 0],
		C = [0, 0, 0],
		D = [0, 0, 0];
	const T: TorsoObject = {
		prof,
		cfg,
		tStart(u: number) {
			if (!cfg.hemCurve) return 0;
			const side = Math.abs(Math.cos(TAU * u));
			return prof.tOfV((cfg.hemCurve * Math.pow(side, 2.6)) / prof.total);
		},
		tEnd(u: number) {
			const fr = Math.max(0, Math.cos(TAU * (u - 0.25))),
				bk = Math.max(0, Math.cos(TAU * (u - 0.75)));
			const drop = cfg.neckDropF * Math.pow(fr, 1.6) + cfg.neckDropB * Math.pow(bk, 1.6);
			return prof.tOfV(1 - drop / prof.total);
		},
		pos(u: number, t: number, o: number[]) {
			prof.at(t, pr);
			const [y, a, b, n] = pr;
			const ph = phiOf(u, phiTable(b / a, n));
			o[0] = -a * sc(Math.cos(ph), n);
			o[1] = y;
			o[2] = b * sc(Math.sin(ph), n);
			return o;
		},
		normal(u: number, t: number, o: number[]) {
			const e = 0.0015;
			T.pos(u + e, t, A);
			T.pos(u - e, t, B);
			T.pos(u, Math.min(1, t + e), C);
			T.pos(u, Math.max(0, t - e), D);
			const ux = A[0] - B[0],
				uy = A[1] - B[1],
				uz = A[2] - B[2],
				vx = C[0] - D[0],
				vy = C[1] - D[1],
				vz = C[2] - D[2];
			let nx = uy * vz - uz * vy,
				ny = uz * vx - ux * vz,
				nz = ux * vy - uy * vx;
			const l = Math.hypot(nx, ny, nz) || 1;
			o[0] = nx / l;
			o[1] = ny / l;
			o[2] = nz / l;
			return o;
		},
		perimeterAt(t: number) {
			prof.at(t, pr);
			return pr[1] * phiTable(pr[2] / pr[1], pr[3]).per;
		},
		px(side: 'front' | 'back', s: number, y: number, W: number, H: number) {
			const t = prof.tOfY(y),
				P = T.perimeterAt(t);
			return [((side === 'front' ? 0.25 : 0.75) + s / P) * W, (1 - prof.vAt(t)) * H];
		}
	};
	return T;
}

export function geomFromGrid(
	cols: number,
	rows: number,
	fn: (i: number, j: number) => { p: number[]; n?: number[]; uv: number[] },
	flip = false,
	normals = true
) {
	const nv = (cols + 1) * (rows + 1);
	const pos = new Float32Array(nv * 3),
		nor = new Float32Array(nv * 3),
		uv = new Float32Array(nv * 2);
	let k = 0;
	for (let i = 0; i <= cols; i++)
		for (let j = 0; j <= rows; j++) {
			const r = fn(i, j);
			pos.set(r.p, k * 3);
			if (r.n) nor.set(r.n, k * 3);
			uv.set(r.uv, k * 2);
			k++;
		}
	const idx: number[] = [];
	for (let i = 0; i < cols; i++)
		for (let j = 0; j < rows; j++) {
			const a = i * (rows + 1) + j,
				b = (i + 1) * (rows + 1) + j,
				c = b + 1,
				d = a + 1;
			if (!flip) idx.push(a, b, d, b, c, d);
			else idx.push(a, d, b, b, d, c);
		}
	const g = new THREE.BufferGeometry();
	g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
	g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
	g.setIndex(idx);
	if (normals) g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
	else g.computeVertexNormals();
	return g;
}

export function torsoGeometry(T: TorsoObject) {
	const I = 240,
		J = 150,
		P = [0, 0, 0],
		N = [0, 0, 0];
	const g = geomFromGrid(I, J, (i, j) => {
		const u = i / I,
			t = lerp(T.tStart(u), T.tEnd(u), j / J);
		T.pos(u, t, P);
		T.normal(u, t, N);
		return { p: [...P], n: [...N], uv: [u, T.prof.vAt(t)] };
	});
	const ah = T.cfg.armhole;
	if (ah) {
		const idx = (g.index?.array as any) || [],
			pos = g.attributes.position.array as Float32Array,
			keep: number[] = [];
		for (let k = 0; k < idx.length; k += 3) {
			let u = 0,
				y = 0;
			for (let m = 0; m < 3; m++) {
				const v = idx[k + m];
				u += Math.floor(v / (J + 1)) / I;
				y += pos[v * 3 + 1];
			}
			u /= 3;
			y /= 3;
			const d = Math.min(Math.abs(u), Math.abs(u - 0.5), Math.abs(u - 1)) * T.perimeterAt(T.prof.tOfY(y));
			if ((d / ah.W) ** 2 + ((y - ah.yc) / ah.H) ** 2 >= 1) keep.push(idx[k], idx[k + 1], idx[k + 2]);
		}
		g.setIndex(keep);
	}
	return g;
}

export function torsoPatch(
	T: TorsoObject,
	u0: number,
	u1: number,
	v0: number,
	v1: number,
	off: number,
	su = 20,
	sv = 20
) {
	const P = [0, 0, 0],
		N = [0, 0, 0];
	return geomFromGrid(su, sv, (i, j) => {
		const u = lerp(u0, u1, i / su),
			t = T.prof.tOfV(lerp(v0, v1, j / sv));
		T.pos(u, t, P);
		T.normal(u, t, N);
		return {
			p: [P[0] + N[0] * off, P[1] + N[1] * off, P[2] + N[2] * off],
			n: [...N],
			uv: [i / su, j / sv]
		};
	});
}

export function surfPoint(T: TorsoObject, u: number, y: number, off: number) {
	const t = T.prof.tOfY(y),
		P = T.pos(u, t, [0, 0, 0]),
		N = T.normal(u, t, [0, 0, 0]);
	return {
		p: new THREE.Vector3(P[0] + N[0] * off, P[1] + N[1] * off, P[2] + N[2] * off),
		n: new THREE.Vector3(...N)
	};
}

export function closedCurve(fn: (f: number) => number[], n = 96) {
	const pts: THREE.Vector3[] = [];
	for (let k = 0; k < n; k++) pts.push(new THREE.Vector3(...fn(k / n)));
	return new THREE.CatmullRomCurve3(pts, true);
}

export function tube(curve: THREE.Curve<THREE.Vector3>, r: number, seg = 160, closed = true) {
	return new THREE.TubeGeometry(curve, seg, r, 6, closed);
}

export interface SleeveConfig {
	S: [number, number];
	beta: number;
	startIn: number;
	taperPow: number;
	alpha: number;
	len: number;
	r0: number;
	r1: number;
	kz: number;
	zc: number;
}

export function sleeveConfig(pid: ProductKey): SleeveConfig {
	const P = PRODUCTS[pid];
	const base = { S: [0.446, 0.49] as [number, number], beta: 72 * DEG, startIn: 0.13, taperPow: 1 };
	if (P.sleeve === 'long')
		return { ...base, alpha: 13 * DEG, len: 1.14, r0: 0.136, r1: 0.095, kz: 0.9, zc: 0.035, taperPow: 0.8 };
	if (P.sleeve === 'tee')
		return { ...base, alpha: 36 * DEG, len: 0.32, r0: 0.136, r1: 0.15, kz: 0.8, zc: 0.02 };
	if (P.sleeve === 'polo')
		return { ...base, alpha: 38 * DEG, len: 0.28, r0: 0.134, r1: 0.14, kz: 0.82, zc: 0.02 };
	return { ...base, alpha: 23 * DEG, len: 0.39, r0: 0.138, r1: 0.165, kz: 0.85, zc: 0.035 };
}

export function sleeveFrame(c: SleeveConfig) {
	const d = [Math.sin(c.alpha), -Math.cos(c.alpha)],
		p = [Math.cos(c.alpha), Math.sin(c.alpha)];
	const O = [c.S[0] - p[0] * c.r0, c.S[1] - p[1] * c.r0];
	return { d, p, O };
}

export function sleeveRadius(c: SleeveConfig, s: number) {
	if (s < 0) return c.r0 * (1 - 0.38 * Math.min(1, -s / c.startIn));
	return lerp(c.r0, c.r1, Math.pow(clamp(s / c.len, 0, 1), c.taperPow));
}

export function sleevePoint(
	c: SleeveConfig,
	side: number,
	s: number,
	th: number,
	rScale = 1,
	rAdd = 0
) {
	const { d, p, O } = sleeveFrame(c);
	let cx: number, cy: number;
	if (s >= 0) {
		cx = O[0] + d[0] * s;
		cy = O[1] + d[1] * s;
	} else {
		cx = O[0] + Math.sin(c.beta) * s;
		cy = O[1] - Math.cos(c.beta) * s;
	}
	const r = sleeveRadius(c, s) * rScale + rAdd,
		rz = r * c.kz,
		co = Math.cos(th),
		si = Math.sin(th);
	let x = cx + p[0] * r * co;
	const y = cy + p[1] * r * co;
	const z = c.zc + rz * si;
	let nx = (p[0] * co) / r,
		ny = (p[1] * co) / r,
		nz = si / rz;
	const l = Math.hypot(nx, ny, nz);
	nx /= l;
	ny /= l;
	nz /= l;
	if (side < 0) {
		x = -x;
		nx = -nx;
	}
	return { p: [x, y, z], n: [nx, ny, nz] };
}

export function sleeveGeom(
	c: SleeveConfig,
	side: number,
	s0: number,
	s1: number,
	rScale = 1,
	rAdd = 0
) {
	const segA = 64,
		segL = Math.max(6, Math.round((s1 - s0) * 80));
	return geomFromGrid(
		segA,
		segL,
		(i, j) => {
			const s = lerp(s0, s1, j / segL),
				r = sleevePoint(c, side, s, (i / segA) * TAU, rScale, rAdd);
			return { p: r.p, n: r.n, uv: [i / segA, j / segL] };
		},
		side < 0
	);
}

export const ROLL = { s0: 0.47, s1: 0.58, extra: 0.026 };

export function rollGeom(c: SleeveConfig, side: number, s0: number, s1: number, extra: number) {
	const segA = 64,
		segL = 28,
		prof = (f: number) => extra * Math.pow(Math.max(0, Math.sin(Math.PI * f)), 0.28);
	const ax = [Math.sin(c.alpha) * (side < 0 ? -1 : 1), -Math.cos(c.alpha), 0];
	return geomFromGrid(
		segA,
		segL,
		(i, j) => {
			const f = j / segL,
				s = lerp(s0, s1, f),
				th = (i / segA) * TAU;
			const pt = sleevePoint(c, side, s, th, 1, 0.004 + prof(f));
			const e = 0.01,
				dr =
					(prof(Math.min(1, f + e)) - prof(Math.max(0, f - e))) /
					((Math.min(1, f + e) - Math.max(0, f - e)) * (s1 - s0));
			const n = [pt.n[0] - ax[0] * dr, pt.n[1] - ax[1] * dr, pt.n[2] - ax[2] * dr],
				l = Math.hypot(...n);
			return { p: pt.p, n: n.map(v => v / l), uv: [i / segA, f] };
		},
		side < 0
	);
}

export const sleeveRing = (c: SleeveConfig, side: number, s: number, rScale = 1, rAdd = 0) =>
	closedCurve(f => sleevePoint(c, side, s, f * TAU, rScale, rAdd).p, 64);

export const COLLAR: Record<string, any> = {
	shirt: {
		gap: 0.004,
		leafGap: 0.024,
		standBack: 0.064,
		standFront: 0.036,
		spread: 0.013,
		back: -0.002,
		front: 0.092,
		tipS: 0.088,
		roll: 0.016,
		span: 0.3
	},
	polo: {
		gap: 0.004,
		leafGap: 0.014,
		standBack: 0.05,
		standFront: 0.024,
		spread: 0.011,
		back: -0.002,
		front: 0.078,
		tipS: 0.082,
		roll: 0.014,
		span: 0.28
	}
};

export function shirtCollar(T: TorsoObject, o: any) {
	const tNeck = T.tEnd(0.75),
		Pn = T.perimeterAt(tNeck),
		gapU = o.gap / Pn,
		wl = o.leafGap / Pn;
	const uOf = (w: number) => 0.25 + gapU + w * (1 - 2 * gapU);
	const endDist = (w: number) => Math.min(w, 1 - w);
	const neck = (w: number) => {
		const u = uOf(w);
		return T.pos(u, T.tEnd(u), [0, 0, 0]);
	};
	const top = (w: number) => {
		const N = neck(w);
		const h = lerp(o.standFront, o.standBack, (1 - Math.cos(Math.PI * Math.min(1, endDist(w) * 2.2))) / 2);
		return [N[0] * 0.985, N[1] + h, N[2] * 0.985];
	};
	const pr = [0, 0, 0, 0],
		yTopNeck = T.prof.at(1, [0, 0, 0, 0])[0];
	const pushOut = (P: number[], lift: number) => {
		if (P[1] > yTopNeck - 0.002) return P;
		T.prof.at(T.prof.tOfY(P[1]), pr);
		const [, a, b, n] = pr;
		const s = Math.pow(Math.pow(Math.abs(P[0]) / a, n) + Math.pow(Math.abs(P[2]) / b, n), 1 / n);
		const need = 1 + lift / Math.min(a, b);
		if (s >= need || s < 1e-6) return P;
		return [(P[0] * need) / s, P[1], (P[2] * need) / s];
	};
	const tTip = T.prof.tOfV(T.prof.vAt(T.tEnd(0.25)) - o.front / T.prof.total),
		Ptip = T.perimeterAt(tTip);
	const tipPt = (sgn: number) => {
		const u = 0.25 + (sgn * o.tipS) / Ptip,
			P = T.pos(u, tTip, [0, 0, 0]),
			Nn = T.normal(u, tTip, [0, 0, 0]);
		return [P[0] + Nn[0] * 0.014, P[1] + Nn[1] * 0.014, P[2] + Nn[2] * 0.014];
	};
	const tips: Record<number, number[]> = { 1: tipPt(1), [-1]: tipPt(-1) };
	const edge = (w: number) => {
		const e = 1 - smooth(0, o.span, Math.max(0, endDist(w) - wl)),
			k = Math.pow(e, 1.2);
		const N = neck(w),
			hl = Math.hypot(N[0], N[2]) || 1;
		const Pb = [N[0] + (N[0] / hl) * o.spread, N[1] - o.back, N[2] + (N[2] / hl) * o.spread];
		const Pf = tips[w < 0.5 ? 1 : -1];
		return pushOut([lerp(Pb[0], Pf[0], k), lerp(Pb[1], Pf[1], k), lerp(Pb[2], Pf[2], k)], 0.012);
	};
	const leafPt = (w: number, f: number) => {
		const A = top(w),
			B = edge(w),
			Nh = neck(w),
			hl = Math.hypot(Nh[0], Nh[2]) || 1;
		const C = [A[0] + (Nh[0] / hl) * o.roll, A[1] + 0.006, A[2] + (Nh[2] / hl) * o.roll];
		const q = 1 - f;
		return [0, 1, 2].map(k => q * q * A[k] + 2 * q * f * C[k] + f * f * B[k]);
	};
	const W = 140,
		Rs = 5,
		Rl = 14;
	const stand = geomFromGrid(
		W,
		Rs,
		(i, j) => {
			const w = i / W,
				N = neck(w),
				Tp = top(w),
				f = j / Rs;
			return { p: [lerp(N[0], Tp[0], f), lerp(N[1] - 0.012, Tp[1], f), lerp(N[2], Tp[2], f)], uv: [w, f] };
		},
		false,
		false
	);
	const leaf = geomFromGrid(
		W,
		Rl,
		(i, j) => ({ p: leafPt(lerp(wl, 1 - wl, i / W), j / Rl), uv: [i / W, j / Rl] }),
		true,
		false
	);
	const line = (fn: (f: number) => number[], n: number) => {
		const a: THREE.Vector3[] = [];
		for (let k = 0; k <= n; k++) a.push(new THREE.Vector3(...fn(k / n)));
		return new THREE.CatmullRomCurve3(a);
	};
	const front = new THREE.Vector3(...neck(0)).lerp(new THREE.Vector3(...neck(1)), 0.5);
	return {
		stand,
		leaf,
		edges: [
			tube(line(w => edge(lerp(wl, 1 - wl, w)), 90), 0.0045, 160, false),
			tube(line(w => top(w), 90), 0.007, 160, false),
			tube(line(f => leafPt(wl, f), 12), 0.0042, 18, false),
			tube(line(f => leafPt(1 - wl, f), 12), 0.0042, 18, false)
		],
		button: front.add(new THREE.Vector3(0, o.standFront * 0.45, 0.004))
	};
}

export function neckband(T: TorsoObject, width: number, off: number) {
	const I = 192,
		R = 4,
		P = [0, 0, 0],
		N = [0, 0, 0];
	return geomFromGrid(I, R, (i, j) => {
		const u = i / I,
			vT = T.prof.vAt(T.tEnd(u)),
			t = T.prof.tOfV(vT - (width / T.prof.total) * (1 - j / R));
		T.pos(u, t, P);
		T.normal(u, t, N);
		return { p: [P[0] + N[0] * off, P[1] + N[1] * off, P[2] + N[2] * off], n: [...N], uv: [u, j / R] };
	});
}
