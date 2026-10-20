import { TAU, hexToRgb, smooth, PRODUCTS, lerp } from '$lib/constants/catalog';
import { COLLAR, type TorsoObject } from './procedural';
import type { ProductKey } from '$lib/types/uniform';

export function trimCanvas(c: HTMLCanvasElement): HTMLCanvasElement {
	const g = c.getContext('2d');
	if (!g) return c;
	const { width: w, height: h } = c;
	const d = g.getImageData(0, 0, w, h).data;
	let x0 = w,
		y0 = h,
		x1 = -1,
		y1 = -1;
	for (let y = 0; y < h; y++)
		for (let x = 0; x < w; x++)
			if (d[(y * w + x) * 4 + 3] > 12) {
				if (x < x0) x0 = x;
				if (x > x1) x1 = x;
				if (y < y0) y0 = y;
				if (y > y1) y1 = y;
			}
	if (x1 < 0) return c;
	const o = document.createElement('canvas');
	o.width = x1 - x0 + 1;
	o.height = y1 - y0 + 1;
	o.getContext('2d')?.drawImage(c, -x0, -y0);
	return o;
}

const placeholderCache = new Map<string, HTMLCanvasElement>();

export function placeholderLogo(color: string): HTMLCanvasElement {
	if (typeof document === 'undefined') return null as any;
	if (placeholderCache.has(color)) return placeholderCache.get(color)!;
	const c = document.createElement('canvas');
	c.width = 820;
	c.height = 260;
	const g = c.getContext('2d');
	if (!g) return c;
	g.strokeStyle = color;
	g.fillStyle = color;
	g.lineJoin = 'round';
	g.lineCap = 'round';
	g.lineWidth = 20;
	g.beginPath();
	g.arc(120, 130, 100, 0, TAU);
	g.stroke();
	g.lineWidth = 22;
	g.beginPath();
	g.moveTo(74, 128);
	g.lineTo(120, 84);
	g.lineTo(166, 128);
	g.stroke();
	g.beginPath();
	g.moveTo(74, 174);
	g.lineTo(120, 130);
	g.lineTo(166, 174);
	g.stroke();
	g.textBaseline = 'alphabetic';
	g.font = '700 150px "Barlow Condensed", "Arial Narrow", Arial, sans-serif';
	g.fillText('LOGO', 250, 160);
	g.font = '600 56px "Barlow Condensed", "Arial Narrow", Arial, sans-serif';
	g.fillText('PERUSAHAAN', 254, 228);
	const t = trimCanvas(c);
	placeholderCache.set(color, t);
	return t;
}

export function processImage(img: HTMLImageElement, removeWhite: boolean): HTMLCanvasElement {
	const iw = img.naturalWidth || img.width || 512,
		ih = img.naturalHeight || img.height || 512;
	const s = Math.min(1, 900 / Math.max(iw, ih));
	const c = document.createElement('canvas');
	c.width = Math.max(1, Math.round(iw * s));
	c.height = Math.max(1, Math.round(ih * s));
	const g = c.getContext('2d');
	if (!g) return c;
	g.drawImage(img, 0, 0, c.width, c.height);
	if (removeWhite) {
		const id = g.getImageData(0, 0, c.width, c.height),
			d = id.data;
		for (let i = 0; i < d.length; i += 4) {
			const m = Math.min(d[i], d[i + 1], d[i + 2]);
			if (m > 240) d[i + 3] = 0;
			else if (m > 212) d[i + 3] = Math.round((d[i + 3] * (240 - m)) / 28);
		}
		g.putImageData(id, 0, 0);
	}
	return trimCanvas(c);
}

export async function decodeTo(src: string | null | undefined, removeWhite = true): Promise<HTMLCanvasElement | null> {
	if (!src) return null;
	const img = new Image();
	img.src = src;
	await img.decode();
	return processImage(img, removeWhite);
}

/* ---------- Weaves / Fabric Bump Normal Map ---------- */
const WS = 128;
export const WEAVES: Record<string, (x: number, y: number) => number> = {
	drill: (x, y) =>
		0.72 * (0.5 + 0.5 * Math.sin((TAU * (x + y)) / WS * 10)) +
		0.28 * (0.5 + 0.5 * Math.sin((TAU * x) / WS * 40)),
	jersey: (x, y) =>
		0.35 + 0.65 * Math.abs(Math.sin((TAU * x) / WS * 8 + 0.7 * Math.sin((TAU * y) / WS * 16))),
	mesh: (x, y) => {
		const row = Math.floor(y / 16);
		const cx = ((x + (row % 2) * 8) % 16) - 8,
			cy = (y % 16) - 8;
		return smooth(2.2, 5.2, Math.hypot(cx, cy));
	},
	pique: (x, y) => {
		const a = Math.abs(Math.sin((TAU * x) / WS * 8)),
			b = Math.abs(Math.sin((TAU * y) / WS * 8));
		return Math.min(1, 0.25 + 0.75 * Math.max(a * 0.85, b));
	},
	rib: (x) => 0.5 + 0.5 * Math.sin((TAU * x) / WS * 16),
	taslan: (x, y) => 0.5 + 0.5 * Math.sin((TAU * (x - y)) / WS * 24),
	ripstop: (x, y) => {
		const gx = Math.abs((x % 16) - 8) < 1.2,
			gy = Math.abs((y % 16) - 8) < 1.2;
		return gx || gy ? 1 : 0.4 + 0.12 * Math.sin((TAU * x) / WS * 32);
	}
};

const weaveHeightCache: Record<string, Float32Array> = {};

export function weaveHeights(kind: string): Float32Array {
	if (weaveHeightCache[kind]) return weaveHeightCache[kind];
	const h = new Float32Array(WS * WS),
		f = WEAVES[kind] || WEAVES.drill;
	for (let y = 0; y < WS; y++) for (let x = 0; x < WS; x++) h[y * WS + x] = f(x, y);
	return (weaveHeightCache[kind] = h);
}

export function weaveNormalCanvas(kind: string, strength: number): HTMLCanvasElement {
	const h = weaveHeights(kind),
		c = document.createElement('canvas');
	c.width = c.height = WS;
	const g = c.getContext('2d');
	if (!g) return c;
	const id = g.createImageData(WS, WS),
		d = id.data;
	const H = (x: number, y: number) => h[((y + WS) % WS) * WS + ((x + WS) % WS)];
	for (let y = 0; y < WS; y++)
		for (let x = 0; x < WS; x++) {
			let nx = (H(x - 1, y) - H(x + 1, y)) * strength,
				ny = (H(x, y + 1) - H(x, y - 1)) * strength,
				nz = 1;
			const l = Math.hypot(nx, ny, nz);
			nx /= l;
			ny /= l;
			nz /= l;
			const k = (y * WS + x) * 4;
			d[k] = (nx * 0.5 + 0.5) * 255;
			d[k + 1] = (ny * 0.5 + 0.5) * 255;
			d[k + 2] = (nz * 0.5 + 0.5) * 255;
			d[k + 3] = 255;
		}
	g.putImageData(id, 0, 0);
	return c;
}

const swatchCache = new Map<string, string>();

export function weaveSwatch(kind: string, color: string): string {
	if (typeof document === 'undefined') return '';
	const key = kind + color;
	if (swatchCache.has(key)) return swatchCache.get(key)!;
	const h = weaveHeights(kind),
		[r, gC, b] = hexToRgb(color),
		c = document.createElement('canvas');
	c.width = c.height = 64;
	const g = c.getContext('2d');
	if (!g) return '';
	const id = g.createImageData(64, 64),
		d = id.data;
	for (let y = 0; y < 64; y++)
		for (let x = 0; x < 64; x++) {
			const v = 0.72 + 0.4 * h[y * 2 * WS + x * 2],
				k = (y * 64 + x) * 4;
			d[k] = r * v;
			d[k + 1] = gC * v;
			d[k + 2] = b * v;
			d[k + 3] = 255;
		}
	g.putImageData(id, 0, 0);
	const url = c.toDataURL();
	swatchCache.set(key, url);
	return url;
}

const OFF = 30000;
export function softPath(
	g: CanvasRenderingContext2D,
	pts: number[][],
	{ width = 10, color = 'rgba(0,0,0,.2)', blur = 12, fill = false } = {}
) {
	g.save();
	g.shadowColor = color;
	g.shadowBlur = blur;
	g.shadowOffsetX = OFF;
	g.shadowOffsetY = 0;
	g.lineCap = 'round';
	g.lineJoin = 'round';
	g.lineWidth = width;
	g.strokeStyle = '#000';
	g.fillStyle = '#000';
	g.beginPath();
	if (pts.length > 2 && !fill) {
		g.moveTo(pts[0][0] - OFF, pts[0][1]);
		for (let i = 1; i < pts.length - 1; i++) {
			const mx = (pts[i][0] + pts[i + 1][0]) / 2,
				my = (pts[i][1] + pts[i + 1][1]) / 2;
			g.quadraticCurveTo(pts[i][0] - OFF, pts[i][1], mx - OFF, my);
		}
		g.lineTo(pts[pts.length - 1][0] - OFF, pts[pts.length - 1][1]);
	} else pts.forEach(([x, y], i) => (i ? g.lineTo(x - OFF, y) : g.moveTo(x - OFF, y)));
	if (fill) {
		g.closePath();
		g.fill();
	} else g.stroke();
	g.restore();
}

export function dashed(
	ctx: CanvasRenderingContext2D,
	pts: number[][],
	color: string,
	width: number,
	dash: number[]
) {
	ctx.save();
	ctx.strokeStyle = color;
	ctx.lineWidth = width;
	ctx.setLineDash(dash);
	ctx.lineCap = 'round';
	ctx.beginPath();
	pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
	ctx.stroke();
	ctx.restore();
}

const WR_SHIRT_FRONT = [
	{ p: [[0.37, 0.24], [0.29, 0.15], [0.19, 0.09]], t: 'v', a: 1 },
	{ p: [[0.38, 0.08], [0.3, -0.01], [0.21, -0.06]], t: 'r', a: 1 },
	{ p: [[0.37, -0.04], [0.3, -0.13], [0.24, -0.17]], t: 'v', a: 1 },
	{ p: [[0.12, -0.2], [0.135, -0.45], [0.11, -0.74]], t: 'v', a: 1 },
	{ p: [[0.27, -0.26], [0.28, -0.5], [0.31, -0.74]], t: 'r', a: 1 },
	{ p: [[0.21, -0.42], [0.215, -0.6], [0.2, -0.76]], t: 'v', a: 0.7 },
	{ p: [[0.05, -0.4], [0.19, -0.35]], t: 'v', a: 0.5 }
];

const WR_SHIRT_BACK = [
	{ p: [[0.37, 0.27], [0.25, 0.19], [0.12, 0.17]], t: 'v', a: 1 },
	{ p: [[0.38, 0.06], [0.27, -0.03]], t: 'r', a: 1 },
	{ p: [[0.1, -0.28], [0.09, -0.55], [0.08, -0.77]], t: 'v', a: 1 },
	{ p: [[0.25, -0.24], [0.27, -0.5], [0.29, -0.74]], t: 'r', a: 1 },
	{ p: [[0.18, -0.45], [0.17, -0.76]], t: 'v', a: 0.6 }
];

const WR_TEE_FRONT = [
	...WR_SHIRT_FRONT,
	{ p: [[0.33, 0.22], [0.14, 0.04], [-0.04, -0.12]], t: 'v', a: 0.8 },
	{ p: [[0.26, -0.04], [0.06, -0.24], [-0.06, -0.33]], t: 'r', a: 0.8 },
	{ p: [[0.11, 0.47], [0.05, 0.38]], t: 'v', a: 0.7 },
	{ p: [[0.35, -0.42], [0.18, -0.6], [0.06, -0.68]], t: 'v', a: 0.8 },
	{ p: [[0.03, 0.1], [0.0, -0.05]], t: 'r', a: 0.5 }
];

const WR_TEE_BACK = [
	...WR_SHIRT_BACK,
	{ p: [[0.34, 0.16], [0.15, 0.0], [-0.03, -0.18]], t: 'v', a: 0.8 },
	{ p: [[0.3, -0.3], [0.12, -0.5], [0.0, -0.58]], t: 'v', a: 0.7 },
	{ p: [[0.2, 0.44], [0.08, 0.36]], t: 'v', a: 0.6 }
];

const shadeCache = new Map<string, { ao: HTMLCanvasElement; bump: HTMLCanvasElement }>();

export function buildShade(
	T: TorsoObject,
	pid: ProductKey,
	pocketCount = 2
): { ao: HTMLCanvasElement; bump: HTMLCanvasElement } {
	const cacheKey = `${pid}:${pocketCount}`;
	if (shadeCache.has(cacheKey)) return shadeCache.get(cacheKey)!;
	const P = PRODUCTS[pid],
		W = 1024,
		H = 640;
	const ao = document.createElement('canvas');
	ao.width = W;
	ao.height = H;
	const a = ao.getContext('2d')!;
	const bump = document.createElement('canvas');
	bump.width = W;
	bump.height = H;
	const b = bump.getContext('2d')!;
	b.fillStyle = '#808080';
	b.fillRect(0, 0, W, H);
	const pxV = H / T.prof.total;
	const toPx = (side: 'front' | 'back', s: number, y: number) => T.px(side, s, y, W, H);
	const crew = P.collar === 'crew',
		tee = P.sleeve === 'tee' || P.sleeve === 'polo';

	const neckLine: number[][] = [];
	for (let k = 0; k <= 96; k++) {
		const u = k / 96;
		neckLine.push([u * W, (1 - T.prof.vAt(T.tEnd(u))) * H + (crew ? 0.035 : 0.012) * pxV]);
	}
	softPath(a, neckLine, {
		width: (crew ? 0.02 : 0.028) * pxV,
		color: `rgba(0,0,0,${crew ? 0.22 : 0.5})`,
		blur: crew ? 10 : 14
	});

	if (COLLAR[P.collar]) {
		const o = COLLAR[P.collar],
			vN = T.prof.vAt(T.tEnd(0.25)),
			tTip = T.prof.tOfV(vN - o.front / T.prof.total),
			Pt = T.perimeterAt(tTip);
		for (const sg of [1, -1]) {
			const tip = [(0.25 + (sg * o.tipS) / Pt) * W, (1 - T.prof.vAt(tTip)) * H];
			const inner = [(0.25 + (sg * (o.leafGap + 0.006)) / Pt) * W, (1 - vN) * H];
			const uS = 0.25 + (sg * 0.15) / Pt,
				outer = [uS * W, (1 - T.prof.vAt(T.tEnd(uS))) * H + 0.01 * pxV];
			softPath(a, [inner, tip, outer].map(([x, y]) => [x + sg * 1.5, y + 3]), {
				width: 3,
				color: 'rgba(0,0,0,.42)',
				blur: 7
			});
		}
	}

	const yLow = P.sleeve === 'long' ? -0.5 : P.sleeve === 'short' ? 0.0 : 0.16;
	if (T.cfg.armhole) {
		const { yc, H: AH, W: AW } = T.cfg.armhole;
		for (const us of [0, 0.5, 1]) {
			const pts: number[][] = [];
			for (let k = 0; k <= 48; k++) {
				const ph = (k / 48) * TAU,
					y = yc + (AH + 0.012) * Math.sin(ph),
					t = T.prof.tOfY(y);
				pts.push([(us + ((AW + 0.014) * Math.cos(ph)) / T.perimeterAt(t)) * W, (1 - T.prof.vAt(t)) * H]);
			}
			softPath(a, pts, { width: 0.016 * pxV, color: 'rgba(0,0,0,.3)', blur: 14 });
		}
	} else {
		for (const cx of [0, 0.5, 1]) {
			const t0 = T.prof.tOfY(0.47),
				t1 = T.prof.tOfY(yLow);
			const x = cx * W;
			softPath(
				a,
				[
					[x, (1 - T.prof.vAt(t0)) * H],
					[x, (1 - T.prof.vAt(t1)) * H]
				],
				{ width: (0.11 / T.perimeterAt(t1)) * W, color: 'rgba(0,0,0,.32)', blur: 34 }
			);
		}
	}

	if (P.placket !== 'none') {
		const yTop = 0.6,
			yBot = P.placket === 'polo' ? 0.355 : -0.85,
			xs = P.placket === 'zip' ? [-0.011, 0.011] : [-0.031];
		for (const xo of xs) {
			const pts: number[][] = [];
			for (let k = 0; k <= 30; k++) pts.push(toPx('front', xo, lerp(yBot, yTop, k / 30)));
			softPath(a, pts, { width: 2.5, color: 'rgba(0,0,0,.45)', blur: 5 });
		}
		if (P.placket === 'polo') {
			const q = [toPx('front', -0.03, 0.355), toPx('front', 0.03, 0.355)];
			softPath(a, q, { width: 2.5, color: 'rgba(0,0,0,.4)', blur: 5 });
		}
	}

	if (P.pockets) {
		const sides = pocketCount === 1 ? [1] : [1, -1];
		for (const sg of sides) {
			const s = sg * 0.18;
			const r = [
				toPx('front', s - 0.08, 0.3),
				toPx('front', s + 0.08, 0.3),
				toPx('front', s + 0.08, 0.118),
				toPx('front', s - 0.08, 0.118)
			];
			softPath(
				a,
				r.map(([x, y]) => [x + 1.5, y + 2.5]),
				{ fill: true, color: 'rgba(0,0,0,.38)', blur: 7 }
			);
			const f = [
				toPx('front', s - 0.083, 0.314),
				toPx('front', s + 0.083, 0.314),
				toPx('front', s + 0.083, 0.244),
				toPx('front', s - 0.083, 0.244)
			];
			softPath(
				a,
				f.map(([x, y]) => [x + 1, y + 3]),
				{ fill: true, color: 'rgba(0,0,0,.3)', blur: 6 }
			);
		}
	}

	if (P.cargo) {
		for (const sg of [1, -1]) {
			const s = sg * 0.2;
			const r = [
				toPx('front', s - 0.105, -0.31),
				toPx('front', s + 0.105, -0.31),
				toPx('front', s + 0.105, -0.56),
				toPx('front', s - 0.105, -0.56)
			];
			softPath(
				a,
				r.map(([x, y]) => [x + 2, y + 3]),
				{ fill: true, color: 'rgba(0,0,0,.4)', blur: 8 }
			);
			const f = [
				toPx('front', s - 0.112, -0.252),
				toPx('front', s + 0.112, -0.252),
				toPx('front', s + 0.112, -0.335),
				toPx('front', s - 0.112, -0.335)
			];
			softPath(
				a,
				f.map(([x, y]) => [x + 1, y + 3]),
				{ fill: true, color: 'rgba(0,0,0,.32)', blur: 6 }
			);
		}
	}

	const many = crew || P.collar === 'stand';
	const front = many ? WR_TEE_FRONT : WR_SHIRT_FRONT,
		back = many ? WR_TEE_BACK : WR_SHIRT_BACK;
	const yMax = tee ? 0.5 : 0.6;
	for (const [side, list] of [
		['front', front],
		['back', back]
	] as const) {
		for (const w of list)
			for (const sg of [1, -1]) {
				if (
					P.pockets &&
					side === 'front' &&
					w.p.some(([s, y]) => y > 0.1 && Math.abs(Math.abs(s) - 0.18) < 0.09)
				)
					continue;
				const pts = w.p.filter(([, y]) => y < yMax).map(([s, y]) => toPx(side, s * sg, y));
				if (pts.length < 2) continue;
				const k = (w.a ?? 1) * (crew ? 1.35 : 1);
				if (w.t === 'v') {
					softPath(a, pts, { width: 0.012 * pxV, color: `rgba(0,0,0,${0.14 * k})`, blur: 14 });
					softPath(a, pts, { width: 0.03 * pxV, color: `rgba(0,0,0,${0.06 * k})`, blur: 28 });
					softPath(b, pts, { width: 0.02 * pxV, color: `rgba(0,0,0,${0.85 * k})`, blur: 18 });
				} else {
					softPath(a, pts, { width: 0.014 * pxV, color: `rgba(255,255,255,${0.16 * k})`, blur: 14 });
					softPath(b, pts, { width: 0.022 * pxV, color: `rgba(255,255,255,${0.8 * k})`, blur: 20 });
				}
			}
	}

	const gy0 = (1 - T.prof.vAt(T.prof.tOfY(-0.15))) * H,
		gy1 = H;
	const grad = a.createLinearGradient(0, gy0, 0, gy1);
	grad.addColorStop(0, 'rgba(0,0,0,0)');
	grad.addColorStop(1, `rgba(0,0,0,${crew ? 0.2 : 0.13})`);
	a.fillStyle = grad;
	a.fillRect(0, gy0, W, gy1 - gy0);

	const hem: number[][] = [];
	for (let k = 0; k <= 96; k++) {
		const u = k / 96;
		hem.push([u * W, (1 - T.prof.vAt(T.tStart(u))) * H - 0.032 * pxV]);
	}
	softPath(a, hem, { width: 2, color: 'rgba(0,0,0,.18)', blur: 4 });
	softPath(b, hem, { width: 3, color: 'rgba(0,0,0,.6)', blur: 4 });

	const res = { ao, bump };
	shadeCache.set(cacheKey, res);
	return res;
}

const stitchPatternCache = new Map<string, HTMLCanvasElement>();

export function satinPattern(ctx: CanvasRenderingContext2D, color: string): CanvasPattern | null {
	if (!stitchPatternCache.has(color)) {
		const c = document.createElement('canvas');
		c.width = c.height = 6;
		const g = c.getContext('2d');
		if (g) {
			g.fillStyle = color;
			g.fillRect(0, 0, 6, 6);
			g.strokeStyle = 'rgba(255,255,255,.2)';
			g.lineWidth = 1.2;
			g.beginPath();
			g.moveTo(-1, 7);
			g.lineTo(7, -1);
			g.moveTo(-4, 4);
			g.lineTo(4, -4);
			g.moveTo(2, 10);
			g.lineTo(10, 2);
			g.stroke();
		}
		stitchPatternCache.set(color, c);
	}
	return ctx.createPattern(stitchPatternCache.get(color)!, 'repeat');
}

let satinLinesCanvas: HTMLCanvasElement | null = null;
export function satinLines(): HTMLCanvasElement {
	if (satinLinesCanvas) return satinLinesCanvas;
	const c = document.createElement('canvas');
	c.width = c.height = 5;
	const q = c.getContext('2d');
	if (q) {
		q.strokeStyle = 'rgba(255,255,255,.35)';
		q.lineWidth = 1;
		q.beginPath();
		q.moveTo(-1, 6);
		q.lineTo(6, -1);
		q.stroke();
	}
	return (satinLinesCanvas = c);
}
