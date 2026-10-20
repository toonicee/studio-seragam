import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
	PRODUCTS,
	SLOT_DEFS,
	FONTS,
	SILVER,
	TAU,
	DEG,
	clamp,
	lerp,
	smooth,
	patternOf,
	mix,
	lum,
	stitchOf,
	autoInk
} from '$lib/constants/catalog';
import type { UniformState, ProductKey, SlotKey } from '$lib/types/uniform';
import {
	torsoConfig,
	makeTorso,
	torsoGeometry,
	torsoPatch,
	surfPoint,
	closedCurve,
	tube,
	sleeveConfig,
	sleevePoint,
	sleeveGeom,
	rollGeom,
	sleeveRing,
	shirtCollar,
	neckband,
	ROLL,
	COLLAR,
	type TorsoObject,
	type SleeveConfig,
	geomFromGrid
} from './procedural';
import {
	buildShade,
	weaveNormalCanvas,
	placeholderLogo,
	satinPattern,
	satinLines,
	dashed,
	softPath
} from './textures';

export interface ThreeEngine {
	buildShirt: (state: UniformState) => void;
	applyWeave: (state: UniformState) => void;
	paintAll: (state: UniformState, userLogoCanvas: HTMLCanvasElement | null, extraImgCanvas: HTMLCanvasElement | null) => void;
	setView: (view: 'front' | 'back' | 'side', instant?: boolean) => void;
	takeSnapshot: (view: 'front' | 'back') => string;
	toggleSpin: () => boolean;
	setMeasure: (state: UniformState) => void;
	resize: () => void;
	destroy: () => void;
}

export function createThreeEngine(
	canvas: HTMLCanvasElement,
	container: HTMLElement,
	onViewChange?: (view: string | null) => void
): ThreeEngine {
	const TW = 2048,
		TH = 1280;

	let renderer: THREE.WebGLRenderer;
	let scene: THREE.Scene;
	let camera: THREE.PerspectiveCamera;
	let controls: OrbitControls;
	let shirt: THREE.Group;
	let needsRender = true;
	let animFrameId = 0;
	let camAnim: {
		s0: THREE.Spherical;
		s1: THREE.Spherical;
		dT: number;
		t0: number;
		dur: number;
	} | null = null;
	let fitDist = 4.6;

	let curTorso: TorsoObject | null = null;
	let curSleeveCfg: SleeveConfig | null = null;
	let curSleeveLen = 0;
	let curPlacketV: [number, number] | null = null;
	let curPid: ProductKey = 'kemeja';

	let measureGroup: THREE.Group | null = null;
	let measureKey = '';
	const dashGeo = new THREE.BoxGeometry(1, 1, 1);

	const btnGeo = new THREE.CylinderGeometry(0.0115, 0.0115, 0.004, 24);
	const btnRimGeo = new THREE.TorusGeometry(0.0095, 0.0021, 8, 24);

	function makeCanvasTex(w: number, h: number, isColor = true) {
		const c = document.createElement('canvas');
		c.width = w;
		c.height = h;
		const ctx = c.getContext('2d')!;
		const tex = new THREE.CanvasTexture(c);
		if (isColor) tex.colorSpace = THREE.SRGBColorSpace;
		return { c, ctx, tex };
	}

	const tx = {
		body: makeCanvasTex(TW, TH),
		bump: makeCanvasTex(TW, TH, false),
		sleeve: makeCanvasTex(512, 1024),
		collar: makeCanvasTex(1024, 128),
		pocket: makeCanvasTex(256, 256),
		flap: makeCanvasTex(256, 128),
		placket: makeCanvasTex(64, 1024),
		cuff: makeCanvasTex(512, 128),
		roll: makeCanvasTex(512, 128),
		zip: makeCanvasTex(32, 1024)
	};

	function fabric(opts: THREE.MeshPhysicalMaterialParameters = {}) {
		return new THREE.MeshPhysicalMaterial({
			color: 0xffffff,
			roughness: 0.88,
			metalness: 0,
			sheen: 0.28,
			sheenRoughness: 0.6,
			sheenColor: new THREE.Color(0xffffff),
			...opts
		});
	}

	const mats = {
		body: fabric({ map: tx.body.tex, bumpMap: tx.bump.tex, bumpScale: 3 }),
		inner: new THREE.MeshStandardMaterial({ side: THREE.BackSide, roughness: 1 }),
		sleeve: fabric({ map: tx.sleeve.tex }),
		sleeveInner: new THREE.MeshStandardMaterial({ side: THREE.BackSide, roughness: 1 }),
		collar: fabric({ map: tx.collar.tex, side: THREE.DoubleSide }),
		pocket: fabric({ map: tx.pocket.tex }),
		flap: fabric({ map: tx.flap.tex }),
		placket: fabric({ map: tx.placket.tex }),
		cuff: fabric({ map: tx.cuff.tex }),
		roll: fabric({ map: tx.roll.tex }),
		zip: new THREE.MeshStandardMaterial({ map: tx.zip.tex, roughness: 0.45, metalness: 0.2 }),
		metal: new THREE.MeshStandardMaterial({ color: 0x8c9198, roughness: 0.32, metalness: 0.85 }),
		binding: fabric(),
		rib: fabric({ side: THREE.DoubleSide }),
		collarOut: fabric({ map: tx.collar.tex }),
		ribOut: fabric(),
		collarIn: new THREE.MeshStandardMaterial({ side: THREE.BackSide, roughness: 1 }),
		edgeBody: fabric(),
		edgeSleeve: fabric(),
		edgeCollar: fabric(),
		edgeCuff: fabric(),
		button: new THREE.MeshStandardMaterial({ roughness: 0.3, metalness: 0 }),
		buttonRim: new THREE.MeshStandardMaterial({ roughness: 0.4 })
	};

	const weaveBase: Record<string, THREE.CanvasTexture> = {};

	// Init renderer
	renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
	renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
	renderer.outputColorSpace = THREE.SRGBColorSpace;
	renderer.toneMapping = THREE.NeutralToneMapping;
	renderer.toneMappingExposure = 1.0;

	scene = new THREE.Scene();
	const pmrem = new THREE.PMREMGenerator(renderer);
	scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
	scene.environmentIntensity = 0.55;

	camera = new THREE.PerspectiveCamera(26, 1, 0.1, 50);
	camera.position.set(0, 0.05, 4.6);

	controls = new OrbitControls(camera, canvas);
	controls.target.set(0, -0.08, 0);
	controls.enableDamping = true;
	controls.dampingFactor = 0.08;
	controls.minDistance = 2.0;
	controls.maxDistance = 8;
	controls.minPolarAngle = 0.35;
	controls.maxPolarAngle = 2.2;
	controls.enablePan = false;
	controls.autoRotateSpeed = 2.2;
	controls.addEventListener('change', () => {
		needsRender = true;
	});
	controls.addEventListener('start', () => {
		onViewChange?.(null);
	});

	scene.add(camera);
	const keyLight = new THREE.DirectionalLight(0xffffff, 1.55);
	keyLight.position.set(-1.7, 3.0, 1.1);
	camera.add(keyLight);

	const fillLight = new THREE.DirectionalLight(0xffffff, 0.38);
	fillLight.position.set(2.6, 0.2, 0.8);
	camera.add(fillLight);

	const topLight = new THREE.DirectionalLight(0xffffff, 0.3);
	topLight.position.set(0, 4, 0);
	scene.add(topLight);

	scene.add(new THREE.HemisphereLight(0xffffff, 0x8f959b, 0.24));

	// Shadow blob
	const sc2 = document.createElement('canvas');
	sc2.width = sc2.height = 256;
	const sg = sc2.getContext('2d')!;
	const grd = sg.createRadialGradient(128, 128, 0, 128, 128, 128);
	grd.addColorStop(0, 'rgba(0,0,0,.30)');
	grd.addColorStop(0.55, 'rgba(0,0,0,.12)');
	grd.addColorStop(1, 'rgba(0,0,0,0)');
	sg.fillStyle = grd;
	sg.fillRect(0, 0, 256, 256);
	const blob = new THREE.Mesh(
		new THREE.PlaneGeometry(1.7, 0.9),
		new THREE.MeshBasicMaterial({
			map: new THREE.CanvasTexture(sc2),
			transparent: true,
			depthWrite: false
		})
	);
	blob.rotation.x = -Math.PI / 2;
	blob.position.y = -0.98;
	scene.add(blob);

	shirt = new THREE.Group();
	scene.add(shirt);

	const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
	for (const k of ['body', 'bump', 'sleeve', 'collar', 'pocket', 'flap', 'placket', 'cuff', 'roll'] as const) {
		tx[k].tex.anisotropy = aniso;
	}

	// Collar In gradient
	const ig = document.createElement('canvas');
	ig.width = 4;
	ig.height = 64;
	const igc = ig.getContext('2d')!;
	const igr = igc.createLinearGradient(0, 64, 0, 0);
	igr.addColorStop(0, '#5e5e5e');
	igr.addColorStop(0.7, '#b8b8b8');
	igr.addColorStop(1, '#e6e6e6');
	igc.fillStyle = igr;
	igc.fillRect(0, 0, 4, 64);
	const igt = new THREE.CanvasTexture(ig);
	igt.colorSpace = THREE.SRGBColorSpace;
	mats.collarIn.map = igt;

	function resize() {
		if (!renderer) return;
		const w = container.clientWidth,
			h = container.clientHeight;
		if (!w || !h) return;
		renderer.setSize(w, h, false);
		camera.aspect = w / h;
		if (w / h < 1) camera.setViewOffset(w, h, 0, -h * 0.075, w, h);
		else camera.clearViewOffset();
		camera.updateProjectionMatrix();
		const tanH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
		fitDist = Math.max(1.95 / (2 * tanH), 1.65 / (2 * tanH * camera.aspect)) + 0.25;
		needsRender = true;
	}

	const ro = new ResizeObserver(resize);
	ro.observe(container);
	resize();

	function addMesh(geo: THREE.BufferGeometry, mat: THREE.Material) {
		const m = new THREE.Mesh(geo, mat);
		shirt.add(m);
		return m;
	}

	function addButton(p: THREE.Vector3, n: THREE.Vector3) {
		const nn = n.clone().normalize();
		const b = new THREE.Mesh(btnGeo, mats.button);
		b.position.copy(p).addScaledVector(nn, 0.002);
		b.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), nn);
		shirt.add(b);

		const r = new THREE.Mesh(btnRimGeo, mats.buttonRim);
		r.position.copy(p).addScaledVector(nn, 0.0043);
		r.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), nn);
		shirt.add(r);
	}

	function disposeShirt() {
		shirt.traverse(o => {
			if ((o as THREE.Mesh).geometry && (o as THREE.Mesh).geometry !== btnGeo && (o as THREE.Mesh).geometry !== btnRimGeo) {
				(o as THREE.Mesh).geometry.dispose();
			}
		});
		shirt.clear();
	}

	function setRepeat(mat: any, rx: number, ry: number) {
		mat.userData.rep = [rx, ry];
		if (mat.normalMap) mat.normalMap.repeat.set(rx, ry);
	}

	function pocketSides(pid: ProductKey, count: number) {
		if (!PRODUCTS[pid].pockets) return [];
		return count === 1 ? [1] : [1, -1];
	}

	function buildShirt(state: UniformState) {
		const pid = state.product,
			P = PRODUCTS[pid];
		curPid = pid;
		disposeShirt();

		const T = makeTorso(torsoConfig(pid));
		curTorso = T;
		curPlacketV = null;
		const Pc = T.perimeterAt(T.prof.tOfY(0.2));

		// Badan
		const tg = torsoGeometry(T);
		addMesh(tg, mats.body);
		addMesh(tg, mats.inner);
		addMesh(
			tube(
				closedCurve(f => T.pos(f, T.tStart(f), [0, 0, 0]), 160),
				0.0045,
				220
			),
			mats.edgeBody
		);
		setRepeat(mats.body, Pc / 0.045, T.prof.total / 0.045);

		// Lengan
		curSleeveCfg = null;
		if (P.sleeve !== 'none') {
			const c = sleeveConfig(pid);
			curSleeveCfg = c;
			const sleeveLen = c.len + c.startIn;
			curSleeveLen = sleeveLen;
			const rolled = P.sleeve === 'long' && state.sleeveStyle === 'gulung';
			if (rolled) curSleeveLen = ROLL.s1 - 0.005 + c.startIn;

			for (const side of [1, -1]) {
				const g = sleeveGeom(c, side, -c.startIn, rolled ? ROLL.s1 - 0.005 : c.len);
				addMesh(g, mats.sleeve);
				addMesh(g, mats.sleeveInner);
				if (rolled) {
					const band = rollGeom(c, side, ROLL.s0, ROLL.s1, ROLL.extra);
					addMesh(band, mats.roll);
					addMesh(band, mats.sleeveInner);
					addMesh(tube(sleeveRing(c, side, ROLL.s1, 1, 0.003), 0.0055, 90), mats.edgeCuff);
					const th0 = Math.PI * 0.32,
						sA = ROLL.s0 - 0.13,
						sB = ROLL.s0 + 0.012;
					const strap = geomFromGrid(
						4,
						16,
						(i, j) => {
							const s = lerp(sA, sB, j / 16),
								taper = 0.45 + 0.55 * smooth(0, 0.25, j / 16);
							const half = (0.016 / (c.r0 * 0.95)) * taper,
								th = th0 + ((i / 4) * 2 - 1) * half;
							const r = sleevePoint(c, side, s, th, 1, 0.005);
							return { p: r.p, n: r.n, uv: [i / 4, j / 16] };
						},
						side < 0
					);
					addMesh(strap, mats.cuff);
					const bp = sleevePoint(c, side, sA + 0.02, th0, 1, 0.008);
					addButton(new THREE.Vector3(...bp.p), new THREE.Vector3(...bp.n));
				} else if (P.sleeve === 'long') {
					addMesh(sleeveGeom(c, side, c.len - 0.12, c.len + 0.004, 1.07, 0.004), mats.cuff);
					addMesh(tube(sleeveRing(c, side, c.len + 0.004, 1.07, 0.004), 0.0048, 80), mats.edgeCuff);
					addMesh(tube(sleeveRing(c, side, c.len - 0.12, 1.07, 0.004), 0.0036, 80), mats.edgeCuff);
					const bp = sleevePoint(c, side, c.len - 0.06, Math.PI * 0.42, 1.07, 0.0045);
					addButton(new THREE.Vector3(...bp.p), new THREE.Vector3(...bp.n));
				} else if (P.sleeve === 'polo') {
					addMesh(sleeveGeom(c, side, c.len - 0.05, c.len + 0.003, 1.04, 0.003), mats.rib);
					addMesh(tube(sleeveRing(c, side, c.len + 0.003, 1.04, 0.003), 0.005, 80), mats.rib);
				} else {
					addMesh(tube(sleeveRing(c, side, c.len), 0.005, 80), mats.edgeSleeve);
				}
			}
			const circ = (TAU * c.r0 * (1 + c.kz)) / 2;
			setRepeat(mats.sleeve, circ / 0.045, curSleeveLen / 0.045);
			setRepeat(mats.cuff, circ / 0.045, 0.12 / 0.045);
			setRepeat(mats.roll, (circ * 1.2) / 0.045, (ROLL.s1 - ROLL.s0) / 0.045);
			setRepeat(mats.rib, circ / 0.04, 1);
		}

		// Rompi armhole binding
		if (T.cfg.armhole) {
			const { yc, H, W } = T.cfg.armhole;
			for (const us of [0, 0.5])
				addMesh(
					tube(
						closedCurve(f => {
							const ph = f * TAU,
								d = W * Math.cos(ph),
								y = yc + H * Math.sin(ph),
								t = T.prof.tOfY(y),
								Pp = T.perimeterAt(t),
								u = us + d / Pp;
							const q = T.pos(u, t, [0, 0, 0]),
								n = T.normal(u, t, [0, 0, 0]);
							return [q[0] + n[0] * 0.003, q[1] + n[1] * 0.003, q[2] + n[2] * 0.003];
						}, 120),
						0.0105,
						200
					),
					mats.binding
				);
		}

		// Kerah
		if (P.collar === 'shirt' || P.collar === 'polo') {
			const shirtK = P.collar === 'shirt';
			const col = shirtCollar(T, COLLAR[P.collar]);
			addMesh(col.stand, shirtK ? mats.collarOut : mats.ribOut);
			addMesh(col.stand, mats.collarIn);
			addMesh(col.leaf, shirtK ? mats.collar : mats.rib);
			col.edges.forEach(e => addMesh(e, shirtK ? mats.edgeCollar : mats.rib));
			setRepeat(mats.collar, 0.62 / 0.045, 0.12 / 0.045);
			setRepeat(mats.collarOut, 0.62 / 0.045, 0.06 / 0.045);
			setRepeat(mats.ribOut, 0.62 / 0.04, 1);
			if (shirtK) addButton(col.button, new THREE.Vector3(0, 0.2, 1));
		} else if (P.collar === 'stand') {
			const Hc = 0.078,
				R2 = 6;
			const band = geomFromGrid(
				160,
				R2,
				(i, j) => {
					const u = i / 160,
						q = T.pos(u, T.tEnd(u), [0, 0, 0]),
						f = j / R2,
						k = 1 + 0.07 * f;
					return { p: [q[0] * k, q[1] + Hc * f - 0.008 * (1 - f), q[2] * k], uv: [u, f] };
				},
				false,
				false
			);
			addMesh(band, mats.collarOut);
			addMesh(band, mats.collarIn);
			addMesh(
				tube(
					closedCurve(f => {
						const q = T.pos(f, T.tEnd(f), [0, 0, 0]);
						return [q[0] * 1.07, q[1] + Hc, q[2] * 1.07];
					}, 128),
					0.008,
					200
				),
				mats.edgeCollar
			);
			setRepeat(mats.collarOut, 0.95 / 0.045, Hc / 0.045);
			const q = T.pos(0.25, T.tEnd(0.25), [0, 0, 0]);
			const head = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.036, 0.012), mats.metal);
			head.position.set(0, q[1] + Hc - 0.024, q[2] * 1.07 + 0.008);
			shirt.add(head);
			const pull = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.05, 0.004), mats.metal);
			pull.position.set(0, q[1] + Hc - 0.06, q[2] * 1.07 + 0.016);
			pull.rotation.x = 0.12;
			shirt.add(pull);
		} else {
			addMesh(neckband(T, 0.034, 0.004), mats.rib);
			addMesh(
				tube(
					closedCurve(f => {
						const t = T.tEnd(f),
							p = T.pos(f, t, [0, 0, 0]),
							n = T.normal(f, t, [0, 0, 0]);
						return [p[0] + n[0] * 0.006, p[1] + n[1] * 0.006 + 0.002, p[2] + n[2] * 0.006];
					}, 128),
					0.008,
					200
				),
				mats.rib
			);
		}

		// Plaket & Kancing
		if (P.placket === 'full') {
			const hw = 0.031 / Pc;
			const v0 = T.prof.vAt(T.tStart(0.25)),
				v1 = T.prof.vAt(T.tEnd(0.25)) - 0.001;
			addMesh(torsoPatch(T, 0.25 - hw, 0.25 + hw, v0, v1, 0.0035, 6, 120), mats.placket);
			setRepeat(mats.placket, 0.062 / 0.045, (T.prof.total * (v1 - v0)) / 0.045);
			curPlacketV = [v0, v1];
			for (const y of [-0.64, -0.43, -0.22, -0.01, 0.2, 0.41]) {
				const s = surfPoint(T, 0.25, y, 0.004);
				addButton(s.p, s.n);
			}
		} else if (P.placket === 'polo') {
			const hw = 0.029 / Pc;
			const v0 = T.prof.vAt(T.prof.tOfY(0.355)),
				v1 = T.prof.vAt(T.tEnd(0.25)) - 0.001;
			addMesh(torsoPatch(T, 0.25 - hw, 0.25 + hw, v0, v1, 0.0035, 6, 30), mats.placket);
			setRepeat(mats.placket, 0.058 / 0.045, (T.prof.total * (v1 - v0)) / 0.045);
			curPlacketV = [v0, v1];
			for (const y of [0.41, 0.5]) {
				const s = surfPoint(T, 0.25, y, 0.004);
				addButton(s.p, s.n);
			}
		} else if (P.placket === 'zip') {
			const hw = 0.009 / Pc;
			const v0 = T.prof.vAt(T.tStart(0.25)),
				v1 = T.prof.vAt(T.tEnd(0.25)) - 0.001;
			addMesh(torsoPatch(T, 0.25 - hw, 0.25 + hw, v0, v1, 0.003, 4, 140), mats.zip);
		}

		// Saku
		const pCount = state.pocketCount[pid] ?? 2;
		if (P.pockets) {
			const vy = (y: number) => T.prof.vAt(T.prof.tOfY(y));
			for (const side of pocketSides(pid, pCount)) {
				const uC = 0.25 + (side * 0.18) / Pc,
					hw = 0.08 / Pc,
					hf = 0.083 / Pc;
				addMesh(torsoPatch(T, uC - hw, uC + hw, vy(0.118), vy(0.3), 0.005, 16, 16), mats.pocket);
				addMesh(torsoPatch(T, uC - hf, uC + hf, vy(0.244), vy(0.314), 0.0095, 16, 8), mats.flap);
				const s = surfPoint(T, uC, 0.262, 0.011);
				addButton(s.p, s.n);
			}
			setRepeat(mats.pocket, 0.16 / 0.045, 0.18 / 0.045);
			setRepeat(mats.flap, 0.166 / 0.045, 0.07 / 0.045);
		}
		if (P.cargo) {
			const vy = (y: number) => T.prof.vAt(T.prof.tOfY(y));
			for (const side of [1, -1]) {
				const uC = 0.25 + (side * 0.2) / Pc,
					hw = 0.105 / Pc,
					hf = 0.112 / Pc;
				addMesh(torsoPatch(T, uC - hw, uC + hw, vy(-0.56), vy(-0.31), 0.006, 16, 16), mats.pocket);
				addMesh(torsoPatch(T, uC - hf, uC + hf, vy(-0.335), vy(-0.252), 0.011, 16, 8), mats.flap);
			}
			setRepeat(mats.pocket, 0.21 / 0.045, 0.25 / 0.045);
			setRepeat(mats.flap, 0.224 / 0.045, 0.083 / 0.045);
		}

		applyWeave(state);
		needsRender = true;
	}

	const WEAVE_STRENGTH: Record<string, number> = {
		drill: 2.2,
		jersey: 2.0,
		mesh: 2.6,
		pique: 2.8,
		rib: 2.4,
		taslan: 1.1,
		ripstop: 2.2
	};

	function applyWeave(state: UniformState) {
		const pid = state.product;
		const curMatId = state.material[pid];
		const matObj = PRODUCTS[pid].materials.find(m => m.id === curMatId) || PRODUCTS[pid].materials[0];
		const kind = matObj.weave;

		for (const k of [
			'body',
			'sleeve',
			'collar',
			'collarOut',
			'pocket',
			'flap',
			'placket',
			'cuff',
			'roll',
			'binding'
		] as const) {
			(mats[k] as THREE.MeshPhysicalMaterial).roughness = kind === 'taslan' ? 0.6 : 0.88;
		}

		const knitTrim = PRODUCTS[pid].sleeve === 'tee' || PRODUCTS[pid].sleeve === 'polo';
		const base = (k: string) => {
			if (!weaveBase[k]) {
				const t = new THREE.CanvasTexture(weaveNormalCanvas(k, WEAVE_STRENGTH[k] || 2.0));
				t.wrapS = t.wrapT = THREE.RepeatWrapping;
				t.anisotropy = 4;
				weaveBase[k] = t;
			}
			return weaveBase[k];
		};

		const assign = (mat: any, k: string, scale: number) => {
			const had = !!mat.normalMap;
			const t = base(k).clone();
			t.needsUpdate = true;
			const rep = mat.userData.rep || [8, 8];
			t.repeat.set(rep[0], rep[1]);
			if (mat.normalMap) mat.normalMap.dispose();
			mat.normalMap = t;
			mat.normalScale.set(scale, scale);
			if (!had) mat.needsUpdate = true;
		};

		for (const k of ['body', 'sleeve', 'collar', 'collarOut', 'pocket', 'flap', 'placket', 'cuff', 'roll'] as const) {
			assign(mats[k], kind, 0.4);
		}
		assign(mats.rib, knitTrim ? 'rib' : kind, 0.55);
		assign(mats.ribOut, knitTrim ? 'rib' : kind, 0.55);
		needsRender = true;
	}

	function paintSimple(t: any, color: string, extra?: (ctx: CanvasRenderingContext2D, w: number, h: number) => void) {
		const { ctx, c } = t;
		ctx.fillStyle = color;
		ctx.fillRect(0, 0, c.width, c.height);
		if (extra) extra(ctx, c.width, c.height);
		t.tex.needsUpdate = true;
	}

	function partColors(state: UniformState) {
		const pid = state.product;
		const L = state.look[pid];
		const pat = patternOf(L.pattern);
		const b = L.body,
			a = L.accent,
			a2 = L.accent2 || '#c8ccce',
			btn = L.button;
		const trim = pat.trim ? a : b;
		const button =
			btn === 'auto'
				? lum(b) > 0.5
					? mix(b, '#000000', 0.04)
					: lum(b) > 0.2
						? mix(b, '#000000', 0.08)
						: mix(b, '#ffffff', 0.12)
				: btn === 'accent'
					? a
					: btn;
		return {
			pat,
			body: b,
			accent: a,
			accent2: a2,
			sleeve: pat.sleeve ? a : b,
			collar: trim,
			flap: trim,
			cuff: trim,
			rib: trim,
			pocket: pat.pocket ? a : b,
			placket: pat.placket ? a : b,
			button
		};
	}

	function paintSleeve(state: UniformState, pc: ReturnType<typeof partColors>) {
		if (!curSleeveCfg) return;
		const color = pc.sleeve;
		const { ctx, c } = tx.sleeve,
			W = c.width,
			H = c.height,
			c0 = curSleeveCfg,
			L = curSleeveLen,
			P = PRODUCTS[state.product];
		ctx.fillStyle = color;
		ctx.fillRect(0, 0, W, H);
		const yOf = (s: number) => (1 - (s + c0.startIn) / L) * H;

		if (pc.pat.sleeveSplit) {
			ctx.fillStyle = pc.accent;
			ctx.fillRect(0, 0, 0.215 * W, H);
			ctx.fillRect(0.785 * W, 0, 0.215 * W + 1, H);
			for (const x of [0.215 * W - 5, 0.785 * W + 5]) dashed(ctx, [[x, 0], [x, H]], stitchOf(pc.accent), 2, [7, 5]);
		}
		const kind = pc.pat.sleeveStripe;
		if (kind === 'double') {
			const long = P.sleeve === 'long' && state.sleeveStyle !== 'gulung';
			const base = P.sleeve === 'long' ? (long ? c0.len - 0.2 : 0.3) : c0.len - 0.1;
			for (const sc of [base, base + 0.03]) {
				const y0 = yOf(sc + 0.006),
					y1 = yOf(sc - 0.006);
				ctx.fillStyle = pc.accent;
				ctx.fillRect(0, y0, W, y1 - y0);
			}
		} else if (kind) {
			const long = P.sleeve === 'long';
			const centers =
				kind === 'reflect' && long
					? [0.32, c0.len - 0.22]
					: kind === 'pipe'
						? [long ? c0.len - 0.135 : c0.len - 0.06]
						: [long ? 0.32 : c0.len - 0.1];
			const wS = kind === 'pipe' ? 0.008 : kind === 'reflect' ? 0.04 : 0.045;
			const col = kind === 'reflect' ? SILVER : pc.accent;
			for (const sc of centers) {
				const y0 = yOf(sc + wS / 2),
					y1 = yOf(sc - wS / 2);
				ctx.fillStyle = col;
				ctx.fillRect(0, y0, W, y1 - y0);
				if (kind !== 'pipe') {
					if (kind === 'reflect') {
						ctx.fillStyle = 'rgba(255,255,255,.35)';
						ctx.fillRect(0, y0 + (y1 - y0) * 0.38, W, (y1 - y0) * 0.24);
					}
					dashed(ctx, [[0, y0 + 4], [W, y0 + 4]], stitchOf(col), 1.6, [6, 4]);
					dashed(ctx, [[0, y1 - 4], [W, y1 - 4]], stitchOf(col), 1.6, [6, 4]);
				}
			}
		}

		// Inner sleeve shadow
		const g = ctx.createLinearGradient(0, 0, W, 0);
		g.addColorStop(0, 'rgba(0,0,0,0)');
		g.addColorStop(0.36, 'rgba(0,0,0,0)');
		g.addColorStop(0.5, 'rgba(0,0,0,.28)');
		g.addColorStop(0.64, 'rgba(0,0,0,0)');
		g.addColorStop(1, 'rgba(0,0,0,0)');
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, W, H);

		softPath(ctx, [[0, yOf(0.005)], [W, yOf(0.005)]], { width: 10, color: 'rgba(0,0,0,.22)', blur: 14 });
		dashed(ctx, [[0, yOf(0.016)], [W, yOf(0.016)]], stitchOf(color), 1.8, [7, 5]);

		if (P.sleeve === 'long' && state.sleeveStyle === 'gulung') {
			const sA = ROLL.s0 - 0.13,
				sB = ROLL.s0 + 0.012,
				uC = 0.16 * W,
				hw = (0.016 / (c0.r0 * 0.95 * TAU)) * W;
			softPath(
				ctx,
				[
					[uC - hw, yOf(sB)],
					[uC - hw, yOf(sA)],
					[uC + hw, yOf(sA)],
					[uC + hw, yOf(sB)]
				],
				{ width: 3, color: 'rgba(0,0,0,.45)', blur: 6 }
			);
			softPath(ctx, [[0, yOf(ROLL.s0 - 0.006)], [W, yOf(ROLL.s0 - 0.006)]], {
				width: 8,
				color: 'rgba(0,0,0,.34)',
				blur: 12
			});
		}
		if (P.sleeve === 'long') {
			for (const [s, a] of [
				[0.46, 0.2],
				[0.52, 0.16],
				[0.58, 0.14],
				[0.86, 0.12],
				[0.93, 0.14]
			]) {
				const pts: number[][] = [];
				for (let k = 0; k <= 12; k++) {
					const x = (k / 12) * W;
					pts.push([x, yOf(s * c0.len) + Math.sin(k * 1.3 + s * 20) * 10]);
				}
				softPath(
					ctx,
					pts.filter((p, i) => i > 1 && i < 11),
					{ width: 5, color: `rgba(0,0,0,${a})`, blur: 12 }
				);
			}
		} else {
			const hemS = c0.len - 0.035;
			if (P.sleeve !== 'polo') {
				softPath(ctx, [[0, yOf(hemS)], [W, yOf(hemS)]], { width: 3, color: 'rgba(0,0,0,.22)', blur: 5 });
				dashed(ctx, [[0, yOf(c0.len - 0.024)], [W, yOf(c0.len - 0.024)]], stitchOf(color), 2.2, [7, 5]);
			}
		}
		tx.sleeve.tex.needsUpdate = true;
	}

	function drawImageSlot(
		img: HTMLCanvasElement,
		x0: number,
		y0: number,
		wpx: number,
		hpx: number,
		bordir: boolean
	) {
		const ctx = tx.body.ctx,
			b = tx.bump.ctx;
		if (!bordir) {
			ctx.drawImage(img, x0, y0, wpx, hpx);
			return;
		}
		const tmp = document.createElement('canvas');
		tmp.width = Math.max(1, Math.ceil(wpx));
		tmp.height = Math.max(1, Math.ceil(hpx));
		const g = tmp.getContext('2d');
		if (!g) return;
		g.drawImage(img, 0, 0, tmp.width, tmp.height);
		g.globalCompositeOperation = 'source-atop';
		g.globalAlpha = 0.5;
		const pat = g.createPattern(satinLines(), 'repeat');
		if (pat) g.fillStyle = pat;
		g.fillRect(0, 0, tmp.width, tmp.height);
		ctx.save();
		ctx.shadowColor = 'rgba(0,0,0,.32)';
		ctx.shadowOffsetX = 1;
		ctx.shadowOffsetY = 1.6;
		ctx.shadowBlur = 1.5;
		ctx.drawImage(tmp, x0, y0);
		ctx.restore();

		const bm = document.createElement('canvas');
		bm.width = tmp.width;
		bm.height = tmp.height;
		const bg = bm.getContext('2d');
		if (bg) {
			bg.drawImage(img, 0, 0, bm.width, bm.height);
			bg.globalCompositeOperation = 'source-in';
			bg.fillStyle = '#ffffff';
			bg.fillRect(0, 0, bm.width, bm.height);
			b.save();
			b.shadowColor = 'rgba(255,255,255,.6)';
			b.shadowBlur = 2;
			b.drawImage(bm, x0, y0);
			b.restore();
		}
	}

	function drawSlot(
		id: SlotKey,
		bordir: boolean,
		state: UniformState,
		userLogo: HTMLCanvasElement | null,
		extraImg: HTMLCanvasElement | null
	) {
		if (!curTorso) return;
		const T = curTorso,
			d = SLOT_DEFS[id],
			s = state.slots[id],
			ctx = tx.body.ctx,
			b = tx.bump.ctx;
		const color = s.color === 'auto' ? autoInk(state.look[state.product].body) : s.color;
		const yBase = d.side === 'front' && PRODUCTS[state.product].frontSlotY ? PRODUCTS[state.product].frontSlotY! : d.y;
		const yC = yBase + (+s.dy || 0),
			t = T.prof.tOfY(yC),
			P = T.perimeterAt(t);
		const pxU = TW / P,
			pxV = TH / T.prof.total,
			ax = pxU / pxV;
		const cx = ((d.side === 'front' ? 0.25 : 0.75) + d.s / P) * TW;
		const cy = (1 - T.prof.vAt(t)) * TH;
		const k = +s.size || 1;
		const lines = String(s.text || '')
			.split('\n')
			.map(x => x.trim())
			.filter(Boolean)
			.slice(0, 3);
		const logo = s.logo ? userLogo || placeholderLogo(color) : null;
		const extra = d.extraH && extraImg ? extraImg : null;

		const fit = (img: HTMLCanvasElement, h: number, maxW: number) => {
			let w = (h * img.width) / img.height;
			if (w > maxW) {
				w = maxW;
				h = (w * img.height) / img.width;
			}
			return [w, h];
		};

		const [lw, lh] = logo ? fit(logo, d.logoH * k, d.maxW * k) : [0, 0];
		const [ew, eh] = extra ? fit(extra, (d.extraH || 0.05) * k, d.maxW * k) : [0, 0];
		const th = d.textH * k,
			gap = th * 0.5;
		const parts = (logo ? 1 : 0) + (lines.length ? 1 : 0) + (extra ? 1 : 0);
		const totalH = lh + lines.length * th * 1.3 + eh + Math.max(0, parts - 1) * gap;
		let y = cy - (totalH * pxV) / 2;

		if (logo) {
			drawImageSlot(logo, cx - (lw * pxU) / 2, y, lw * pxU, lh * pxV, bordir);
			y += (lh + gap) * pxV;
		}

		for (const line of lines) {
			let fpx = th * pxV;
			const my = y + (th * 1.3 * pxV) / 2;
			ctx.save();
			ctx.translate(cx, my);
			ctx.scale(ax, 1);
			const fontSpec = FONTS[s.font] || FONTS.tegas;
			ctx.font = fontSpec.css(fpx);
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			const maxW = (d.maxW * k * pxU) / ax,
				mw = ctx.measureText(line).width;
			if (mw > maxW) {
				fpx *= maxW / mw;
				ctx.font = fontSpec.css(fpx);
			}
			if (bordir) {
				ctx.shadowColor = 'rgba(0,0,0,.32)';
				ctx.shadowOffsetX = 1;
				ctx.shadowOffsetY = 1.6;
				ctx.shadowBlur = 1.5;
				const satin = satinPattern(ctx, color);
				ctx.fillStyle = satin || color;
			} else ctx.fillStyle = color;
			ctx.fillText(line, 0, 0);
			ctx.restore();

			if (bordir) {
				b.save();
				b.translate(cx, my);
				b.scale(ax, 1);
				b.font = fontSpec.css(fpx);
				b.textAlign = 'center';
				b.textBaseline = 'middle';
				b.shadowColor = 'rgba(255,255,255,.6)';
				b.shadowBlur = 2;
				b.fillStyle = '#ffffff';
				b.fillText(line, 0, 0);
				b.restore();
			}
			y += th * 1.3 * pxV;
		}

		if (lines.length && extra) y += gap * pxV;
		if (extra) drawImageSlot(extra, cx - (ew * pxU) / 2, y, ew * pxU, eh * pxV, bordir);
	}

	function paintBody(
		state: UniformState,
		pc: ReturnType<typeof partColors>,
		userLogo: HTMLCanvasElement | null,
		extraImg: HTMLCanvasElement | null
	) {
		if (!curTorso) return;
		const T = curTorso,
			{ ctx } = tx.body,
			b = tx.bump.ctx;
		const pxV = TH / T.prof.total;
		const yPx = (y: number) => (1 - T.prof.vAt(T.prof.tOfY(y))) * TH;
		const pCount = state.pocketCount[state.product] ?? 2;
		const shade = buildShade(T, curPid, pCount),
			P0 = PRODUCTS[curPid];

		ctx.fillStyle = pc.body;
		ctx.fillRect(0, 0, TW, TH);
		b.drawImage(shade.bump, 0, 0, TW, TH);
		const groove = (pts: number[][], w = 2) => dashed(b, pts, '#5a5a5a', w, []);

		const kind = pc.pat.body,
			A = pc.accent;
		const topPanel = (boundary: (u: number) => number, fill: boolean) => {
			const pts: number[][] = [];
			for (let x = 0; x <= TW; x += 8) pts.push([x, yPx(boundary(x / TW))]);
			if (fill) {
				ctx.fillStyle = A;
				ctx.beginPath();
				ctx.moveTo(0, 0);
				pts.forEach(p => ctx.lineTo(p[0], p[1]));
				ctx.lineTo(TW, 0);
				ctx.closePath();
				ctx.fill();
				dashed(
					ctx,
					pts.map(([x, y]) => [x, y + 0.008 * pxV]),
					stitchOf(A),
					2.4,
					[8, 6]
				);
			} else {
				ctx.save();
				ctx.strokeStyle = A;
				ctx.lineWidth = 0.009 * pxV;
				ctx.beginPath();
				pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
				ctx.stroke();
				ctx.restore();
			}
			groove(pts);
		};

		const yokeLine = (u: number) => lerp(0.42, 0.46, (Math.cos(TAU * (u - 0.25)) + 1) / 2);
		const band = (yLo: number, yHi: number, col: string, reflect: boolean) => {
			const a0 = yPx(yHi),
				a1 = yPx(yLo);
			ctx.fillStyle = col;
			ctx.fillRect(0, a0, TW, a1 - a0);
			if (reflect) {
				ctx.fillStyle = 'rgba(255,255,255,.35)';
				ctx.fillRect(0, a0 + (a1 - a0) * 0.38, TW, (a1 - a0) * 0.24);
			}
			dashed(ctx, [[0, a0 + 5], [TW, a0 + 5]], stitchOf(col), 2, [8, 6]);
			dashed(ctx, [[0, a1 - 5], [TW, a1 - 5]], stitchOf(col), 2, [8, 6]);
			groove([[0, a0], [TW, a0]]);
			groove([[0, a1], [TW, a1]]);
		};

		if (kind === 'yoke') topPanel(yokeLine, true);
		if (kind === 'piping') topPanel(yokeLine, false);
		if (kind === 'raglan') {
			topPanel(u => {
				const Pc = T.perimeterAt(T.prof.tOfY(0.2));
				const d = Math.min(Math.abs(u - 0.25), Math.abs(u - 0.75)) * Pc;
				return lerp(0.64, 0.2, clamp((d - 0.07) / 0.33, 0, 1));
			}, true);
		}
		if (kind === 'bottom') {
			const a0 = yPx(-0.3);
			ctx.fillStyle = A;
			ctx.fillRect(0, a0, TW, TH - a0);
			dashed(ctx, [[0, a0 + 6], [TW, a0 + 6]], stitchOf(A), 2.4, [8, 6]);
			groove([[0, a0], [TW, a0]]);
		}
		if (kind === 'stripe') band(-0.005, 0.05, A, false);
		if (kind === 'reflect') {
			band(0.0, 0.048, SILVER, true);
			band(-0.43, -0.382, SILVER, true);
		}
		if (kind === 'upper' || kind === 'upperReflect') {
			const a0 = yPx(0.06);
			ctx.fillStyle = A;
			ctx.fillRect(0, 0, TW, a0);
			dashed(ctx, [[0, a0 + 6], [TW, a0 + 6]], stitchOf(pc.body), 2.4, [8, 6]);
			groove([[0, a0], [TW, a0]]);
			if (kind === 'upperReflect') band(0.036, 0.084, SILVER, true);
		}
		if (kind === 'vest') {
			const yEnd = P0.cargo ? -0.62 : -0.42;
			for (const [uc, s] of [
				[0.25, P0.cargo ? 0.345 : 0.305],
				[0.75, 0.21]
			])
				for (const sg of [1, -1]) {
					const pts: number[][] = [];
					for (let y = 0.5; y >= yEnd; y -= 0.02) {
						const t = T.prof.tOfY(y),
							P = T.perimeterAt(t);
						pts.push([(uc + (sg * s) / P) * TW, yPx(y)]);
					}
					const Pc = T.perimeterAt(T.prof.tOfY(0.2));
					const wpx = (0.045 / Pc) * TW;
					ctx.save();
					ctx.strokeStyle = SILVER;
					ctx.lineWidth = wpx;
					ctx.lineCap = 'butt';
					ctx.beginPath();
					pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
					ctx.stroke();
					ctx.strokeStyle = 'rgba(255,255,255,.35)';
					ctx.lineWidth = wpx * 0.24;
					ctx.stroke();
					ctx.restore();
					for (const off of [-wpx / 2 + 5, wpx / 2 - 5])
						dashed(ctx, pts.map(([x, y]) => [x + off, y]), stitchOf(SILVER), 1.8, [7, 5]);
				}
			if (P0.cargo) band(-0.66, -0.612, SILVER, true);
			else band(-0.43, -0.382, SILVER, true);
		}

		const raglanY = (u: number) => {
			const Pc = T.perimeterAt(T.prof.tOfY(0.2));
			const d = Math.min(Math.abs(u - 0.25), Math.abs(u - 0.75)) * Pc;
			return lerp(0.62, 0.25, Math.pow(clamp((d - 0.085) / 0.34, 0, 1), 0.8));
		};
		if (kind === 'sport2' || kind === 'sport3') {
			topPanel(raglanY, true);
			if (kind === 'sport3') {
				ctx.fillStyle = pc.accent2;
				const Pc = T.perimeterAt(T.prof.tOfY(0.2));
				for (let x = 0; x < TW; x += 4) {
					const u = x / TW,
						d = Math.min(Math.abs(u - 0.25), Math.abs(u - 0.75)) * Pc;
					if (d < 0.09) continue;
					const yb = raglanY(u),
						a0 = yPx(yb),
						a1 = yPx(yb - 0.042 * smooth(0.09, 0.16, d));
					ctx.fillRect(x, a0, 4.5, a1 - a0);
				}
				const lo: number[][] = [];
				for (let x = 0; x <= TW; x += 8) {
					const u = x / TW,
						d = Math.min(Math.abs(u - 0.25), Math.abs(u - 0.75)) * Pc;
					if (d >= 0.1) lo.push([x, yPx(raglanY(u) - 0.042)]);
					else if (lo.length) {
						dashed(ctx, lo.splice(0), stitchOf(pc.accent2), 2, [7, 5]);
					}
				}
				if (lo.length) dashed(ctx, lo, stitchOf(pc.accent2), 2, [7, 5]);
			}
		}

		if (kind === 'sport2' || kind === 'sport3' || kind === 'sideCurve') {
			const wOf = (y: number) => 0.22 * Math.pow(clamp((0.28 - y) / 1.08, 0, 1), 0.62);
			ctx.fillStyle = A;
			for (const us of [0, 0.5, 1]) {
				const L: number[][] = [],
					R: number[][] = [];
				for (let y = 0.3; y >= -0.86; y -= 0.02) {
					const t = T.prof.tOfY(Math.max(y, -0.8)),
						P = T.perimeterAt(t),
						w = wOf(y) / P;
					const py = y < -0.79 ? TH : yPx(y);
					L.push([(us - w) * TW, py]);
					R.push([(us + w) * TW, py]);
				}
				ctx.beginPath();
				L.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
				[...R].reverse().forEach(([x, y]) => ctx.lineTo(x, y));
				ctx.closePath();
				ctx.fill();
				for (const edge of [L, R]) {
					const inward = edge === L ? 6 : -6;
					dashed(ctx, edge.map(([x, y]) => [x + inward, y]), stitchOf(A), 2.2, [8, 6]);
					groove(edge);
				}
			}
		}

		if (kind === 'side') {
			const Pc = T.perimeterAt(T.prof.tOfY(0.2));
			const wU = (0.15 / Pc) * TW;
			ctx.fillStyle = A;
			for (const cx of [0, TW / 2, TW]) {
				ctx.fillRect(cx - wU / 2, 0, wU, TH);
				for (const ex of [cx - wU / 2, cx + wU / 2]) {
					dashed(
						ctx,
						[
							[ex + (ex < cx ? 6 : -6), 0],
							[ex + (ex < cx ? 6 : -6), TH]
						],
						stitchOf(A),
						2.4,
						[8, 6]
					);
					groove([[ex, 0], [ex, TH]]);
				}
			}
		} else {
			ctx.strokeStyle = 'rgba(0,0,0,.10)';
			ctx.lineWidth = 2;
			for (const x of [1, TW / 2, TW - 1]) {
				ctx.beginPath();
				ctx.moveTo(x, 0);
				ctx.lineTo(x, TH);
				ctx.stroke();
				groove([[x, 0], [x, TH]], 3);
			}
		}

		const vestP = P0.cargo;
		if (kind === 'chestStrips' || kind === 'chestStripsWaist') {
			for (const sg of [1, -1]) {
				const pts: number[][] = [];
				for (let k = 0; k <= 12; k++) {
					const s = sg * lerp(0.045, 0.31, k / 12);
					const t = T.prof.tOfY(0.412);
					pts.push([(0.25 + s / T.perimeterAt(t)) * TW, yPx(0.412)]);
				}
				const wpx = 0.032 * pxV;
				ctx.save();
				ctx.strokeStyle = '#b9c8d8';
				ctx.lineWidth = wpx;
				ctx.beginPath();
				pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
				ctx.stroke();
				ctx.strokeStyle = 'rgba(255,255,255,.4)';
				ctx.lineWidth = wpx * 0.25;
				ctx.stroke();
				ctx.restore();
				for (const off of [-wpx / 2 + 4, wpx / 2 - 4])
					dashed(ctx, pts.map(([x, y]) => [x, y + off]), '#8d9aa8', 1.6, [6, 4]);
			}
			if (kind === 'chestStripsWaist') band(vestP ? -0.64 : -0.43, vestP ? -0.6 : -0.382, SILVER, true);
		}

		if (vestP) {
			const zs = 0.072,
				zt = T.prof.tOfY(0.2),
				zx = (0.25 + zs / T.perimeterAt(zt)) * TW;
			ctx.fillStyle = '#26282c';
			ctx.fillRect(zx - 0.006 * pxV, yPx(0.31), 0.012 * pxV, yPx(0.1) - yPx(0.31));
			ctx.fillStyle = '#5c6067';
			for (let y = yPx(0.31); y < yPx(0.1); y += 6) ctx.fillRect(zx - 2, y, 4, 2.5);
			ctx.fillStyle = '#8c9198';
			ctx.fillRect(zx - 0.006 * pxV, yPx(0.31), 0.012 * pxV, 0.03 * pxV);
			groove([[zx, yPx(0.31)], [zx, yPx(0.1)]], 3);

			if (state.vestFlag) {
				const t = T.prof.tOfY(0.462),
					Pp = T.perimeterAt(t),
					cx = (0.25 - 0.18 / Pp) * TW,
					cy = yPx(0.462);
				const fw = (0.078 / Pp) * TW,
					fh = 0.05 * pxV;
				ctx.save();
				ctx.shadowColor = 'rgba(0,0,0,.3)';
				ctx.shadowOffsetY = 2;
				ctx.shadowBlur = 3;
				ctx.fillStyle = '#d32f2f';
				ctx.fillRect(cx - fw / 2, cy - fh / 2, fw, fh / 2);
				ctx.restore();
				ctx.fillStyle = '#f5f5f2';
				ctx.fillRect(cx - fw / 2, cy, fw, fh / 2);
				ctx.strokeStyle = 'rgba(0,0,0,.25)';
				ctx.lineWidth = 2;
				ctx.strokeRect(cx - fw / 2, cy - fh / 2, fw, fh);
				b.fillStyle = '#c8c8c8';
				b.fillRect(cx - fw / 2, cy - fh / 2, fw, fh);
			}
		}

		// Kelim bawah jahitan
		const hem: number[][] = [];
		for (let x = 0; x <= TW; x += 8) {
			const u = x / TW;
			hem.push([x, (1 - T.prof.vAt(T.tStart(u))) * TH - 0.028 * pxV]);
		}
		dashed(ctx, hem, stitchOf(pc.body), 2.4, [8, 6]);

		// Slot logo dan tulisan
		const P = PRODUCTS[state.product];
		for (const id of P.slots) {
			if (state.slotOn[state.product]?.[id]) {
				drawSlot(id, P.finish === 'bordir', state, userLogo, extraImg);
			}
		}

		// Ambient occlusion overlay
		ctx.drawImage(shade.ao, 0, 0, TW, TH);
		tx.body.tex.needsUpdate = true;
		tx.bump.tex.needsUpdate = true;
	}

	function paintAll(
		state: UniformState,
		userLogo: HTMLCanvasElement | null,
		extraImg: HTMLCanvasElement | null
	) {
		if (!curTorso) return;
		const pc = partColors(state);
		const piping = pc.pat.body === 'piping';
		const vestP = PRODUCTS[state.product].collar === 'stand';

		paintBody(state, pc, userLogo, extraImg);
		paintSleeve(state, pc);

		paintSimple(tx.collar, pc.collar, (ctx, w, h) => {
			if (vestP) {
				dashed(ctx, [[0, h * 0.14], [w, h * 0.14]], stitchOf(pc.collar), 2, [7, 5]);
				dashed(ctx, [[0, h * 0.86], [w, h * 0.86]], stitchOf(pc.collar), 2, [7, 5]);
				ctx.fillStyle = '#26282c';
				ctx.fillRect(w * 0.25 - 5, 0, 10, h);
				ctx.fillStyle = '#5c6067';
				for (let y = 0; y < h; y += 4) ctx.fillRect(w * 0.25 - 2 + (y % 8 ? 1 : -1), y, 3, 2);
				return;
			}
			dashed(ctx, [[0, h * 0.18], [w, h * 0.18]], stitchOf(pc.collar), 2, [7, 5]);
			softPath(ctx, [[0, h * 0.02], [w, h * 0.02]], { width: 6, color: 'rgba(0,0,0,.25)', blur: 10 });
		});

		paintSimple(tx.zip, '#26282c', (ctx, w, h) => {
			ctx.fillStyle = '#5c6067';
			for (let y = 0; y < h; y += 6) ctx.fillRect(w / 2 - 4 + (y % 12 ? 2 : -2), y, 6, 3);
			ctx.fillStyle = 'rgba(255,255,255,.08)';
			ctx.fillRect(0, 0, 3, h);
			ctx.fillRect(w - 3, 0, 3, h);
		});

		paintSimple(tx.pocket, pc.pocket, (ctx, w, h) => {
			const s = stitchOf(pc.pocket);
			const g = ctx.createLinearGradient(w * 0.4, 0, w * 0.6, 0);
			g.addColorStop(0, 'rgba(0,0,0,.12)');
			g.addColorStop(0.15, 'rgba(255,255,255,.10)');
			g.addColorStop(0.85, 'rgba(255,255,255,.10)');
			g.addColorStop(1, 'rgba(0,0,0,.12)');
			ctx.fillStyle = g;
			ctx.fillRect(w * 0.4, 0, w * 0.2, h);
			ctx.strokeStyle = 'rgba(0,0,0,.22)';
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.moveTo(w * 0.4, 0);
			ctx.lineTo(w * 0.4, h);
			ctx.moveTo(w * 0.6, 0);
			ctx.lineTo(w * 0.6, h);
			ctx.stroke();
			dashed(ctx, [[12, 0], [12, h - 12], [w - 12, h - 12], [w - 12, 0]], s, 2.4, [8, 6]);

			const sh = ctx.createLinearGradient(0, 0, 0, h * 0.3);
			sh.addColorStop(0, 'rgba(0,0,0,.32)');
			sh.addColorStop(1, 'rgba(0,0,0,0)');
			ctx.fillStyle = sh;
			ctx.fillRect(0, 0, w, h * 0.3);

			if (piping) {
				ctx.strokeStyle = pc.accent;
				ctx.lineWidth = 7;
				ctx.beginPath();
				ctx.moveTo(4, 0);
				ctx.lineTo(4, h - 4);
				ctx.lineTo(w - 4, h - 4);
				ctx.lineTo(w - 4, 0);
				ctx.stroke();
			}
		});

		paintSimple(tx.flap, pc.flap, (ctx, w, h) => {
			dashed(ctx, [[10, h], [10, 12], [w - 10, 12], [w - 10, h]], stitchOf(pc.flap), 2.4, [8, 6]);
			const hl = ctx.createLinearGradient(0, 0, 0, h);
			hl.addColorStop(0, 'rgba(0,0,0,.14)');
			hl.addColorStop(0.35, 'rgba(255,255,255,.06)');
			hl.addColorStop(1, 'rgba(0,0,0,0)');
			ctx.fillStyle = hl;
			ctx.fillRect(0, 0, w, h);
			if (PRODUCTS[state.product].cargo) {
				ctx.fillStyle = '#f2f2ee';
				ctx.fillRect(w / 2 - 9, h - 52, 18, 52);
				ctx.fillStyle = '#c62828';
				ctx.fillRect(w / 2 - 9, h - 40, 18, 7);
				ctx.fillRect(w / 2 - 9, h - 22, 18, 7);
				ctx.strokeStyle = 'rgba(0,0,0,.3)';
				ctx.lineWidth = 1.5;
				ctx.strokeRect(w / 2 - 9, h - 52, 18, 52);
			} else {
				ctx.fillStyle = 'rgba(0,0,0,.25)';
				ctx.fillRect(w / 2 - 14, 38, 28, 3);
			}
			if (piping) {
				ctx.strokeStyle = pc.accent;
				ctx.lineWidth = 7;
				ctx.beginPath();
				ctx.moveTo(4, h);
				ctx.lineTo(4, 4);
				ctx.lineTo(w - 4, 4);
				ctx.lineTo(w - 4, h);
				ctx.stroke();
			}
		});

		paintSimple(tx.placket, pc.placket, (ctx, w, h) => {
			if (!pc.pat.placket && curPlacketV && curTorso) {
				const [v0, v1] = curPlacketV,
					T = curTorso;
				const yOf = (y: number) => (1 - (T.prof.vAt(T.prof.tOfY(y)) - v0) / (v1 - v0)) * h;
				const k = pc.pat.body;
				const fillY = (yLo: number, yHi: number, col: string, refl = false) => {
					const a = yOf(yHi),
						b = yOf(yLo);
					ctx.fillStyle = col;
					ctx.fillRect(0, a, w, b - a);
					if (refl) {
						ctx.fillStyle = 'rgba(255,255,255,.35)';
						ctx.fillRect(0, a + (b - a) * 0.38, w, (b - a) * 0.24);
					}
				};
				if (k === 'bottom') fillY(-2, -0.3, pc.accent);
				if (k === 'stripe') fillY(-0.005, 0.05, pc.accent);
				if (k === 'reflect') {
					fillY(0.0, 0.048, SILVER, true);
					fillY(-0.43, -0.382, SILVER, true);
				}
				if (k === 'yoke' || k === 'raglan') fillY(k === 'yoke' ? 0.46 : 0.64, 2, pc.accent);
				if (k === 'upper' || k === 'upperReflect') fillY(0.06, 2, pc.accent);
				if (k === 'upperReflect') fillY(0.036, 0.084, SILVER, true);
				if (k === 'vest') fillY(-0.43, -0.382, SILVER, true);
			}
			const s = stitchOf(pc.placket);
			dashed(ctx, [[6, 0], [6, h]], s, 1.6, [6, 4]);
			dashed(ctx, [[w - 6, 0], [w - 6, h]], s, 1.6, [6, 4]);
			const g = ctx.createLinearGradient(0, 0, w, 0);
			g.addColorStop(0, 'rgba(255,255,255,.12)');
			g.addColorStop(1, 'rgba(0,0,0,.06)');
			ctx.fillStyle = g;
			ctx.fillRect(0, 0, w, h);
			if (piping) {
				ctx.fillStyle = pc.accent;
				ctx.fillRect(0, 0, 4, h);
				ctx.fillRect(w - 4, 0, 4, h);
			}
		});

		paintSimple(tx.cuff, pc.cuff, (ctx, w, h) => {
			dashed(ctx, [[0, 14], [w, 14]], stitchOf(pc.cuff), 2, [7, 5]);
			dashed(ctx, [[0, h - 14], [w, h - 14]], stitchOf(pc.cuff), 2, [7, 5]);
		});

		paintSimple(tx.roll, pc.cuff, (ctx, w, h) => {
			softPath(ctx, [[0, h * 0.5 + 2], [w, h * 0.5 + 2]], { width: 4, color: 'rgba(0,0,0,.42)', blur: 5 });
			ctx.fillStyle = 'rgba(255,255,255,.16)';
			ctx.fillRect(0, h * 0.5 - 7, w, 4);
			dashed(ctx, [[0, h * 0.2], [w, h * 0.2]], stitchOf(pc.cuff), 1.8, [7, 5]);
			dashed(ctx, [[0, h * 0.8], [w, h * 0.8]], stitchOf(pc.cuff), 1.8, [7, 5]);
		});

		for (const [m, col] of [
			[mats.body, pc.body],
			[mats.sleeve, pc.sleeve],
			[mats.collar, pc.collar],
			[mats.collarOut, pc.collar],
			[mats.pocket, pc.pocket],
			[mats.flap, pc.flap],
			[mats.placket, pc.placket],
			[mats.cuff, pc.cuff],
			[mats.roll, pc.cuff]
		] as const) {
			m.color.set('#ffffff');
			(m as THREE.MeshPhysicalMaterial).sheenColor.set(mix(col, '#ffffff', 0.35));
		}

		for (const m of [mats.rib, mats.ribOut]) {
			m.color.set(pc.rib);
			(m as THREE.MeshPhysicalMaterial).sheenColor.set(mix(pc.rib, '#ffffff', 0.35));
		}

		mats.collarIn.color.set(
			vestP ? state.look.rompi.lining || '#1c1d20' : PRODUCTS[state.product].collar === 'polo' ? pc.rib : pc.collar
		);
		mats.binding.color.set(pc.collar);
		mats.binding.sheenColor.set(mix(pc.collar, '#ffffff', 0.35));

		for (const [k, col] of [
			['edgeBody', pc.body],
			['edgeSleeve', pc.sleeve],
			['edgeCollar', pc.collar],
			['edgeCuff', pc.cuff]
		] as const) {
			mats[k].color.set(col);
			mats[k].sheenColor.set(mix(col, '#ffffff', 0.35));
		}

		mats.inner.color.set(vestP ? state.look.rompi.lining || '#1c1d20' : mix(pc.body, '#000000', 0.3));
		mats.sleeveInner.color.set(mix(pc.sleeve, '#000000', 0.3));
		mats.button.color.set(pc.button);
		mats.buttonRim.color.set(mix(pc.button, lum(pc.button) > 0.4 ? '#000000' : '#ffffff', 0.12));

		setMeasure(state);
		needsRender = true;
	}

	const VIEWS: Record<string, [number, number, number]> = {
		front: [0, 0.22, 1],
		back: [0, 0.14, -1],
		side: [0.86, 0.18, 0.5]
	};

	function setView(v: 'front' | 'back' | 'side', instant = false) {
		if (!camera) return;
		const dir = new THREE.Vector3(...VIEWS[v]).normalize();
		const to = controls.target.clone().addScaledVector(dir, fitDist);
		onViewChange?.(v);
		if (instant) {
			camera.position.copy(to);
			camAnim = null;
			controls.update();
			needsRender = true;
			return;
		}
		const from = camera.position.clone().sub(controls.target);
		const toRel = to.clone().sub(controls.target);
		const s0 = new THREE.Spherical().setFromVector3(from),
			s1 = new THREE.Spherical().setFromVector3(toRel);
		let dT = s1.theta - s0.theta;
		if (dT > Math.PI) dT -= TAU;
		if (dT < -Math.PI) dT += TAU;
		camAnim = { s0, s1, dT, t0: performance.now(), dur: 650 };
	}

	function takeSnapshot(view: 'front' | 'back'): string {
		const w = 880,
			h = 1100;
		const prevPos = camera.position.clone();
		const size = renderer.getSize(new THREE.Vector2()),
			pr = renderer.getPixelRatio();
		renderer.setPixelRatio(1);
		renderer.setSize(w, h, false);
		camera.aspect = w / h;
		camera.clearViewOffset();
		camera.updateProjectionMatrix();

		const tanH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
		const dist = Math.max(1.95 / (2 * tanH), 1.65 / (2 * tanH * camera.aspect)) + 0.2;
		camera.position.copy(controls.target).addScaledVector(new THREE.Vector3(...VIEWS[view]).normalize(), dist);
		camera.lookAt(controls.target);

		if (measureGroup) measureGroup.visible = false;
		renderer.render(scene, camera);
		const url = renderer.domElement.toDataURL('image/png');
		if (measureGroup) measureGroup.visible = true;

		renderer.setPixelRatio(pr);
		renderer.setSize(size.x, size.y, false);
		camera.position.copy(prevPos);
		camera.lookAt(controls.target);
		resize();
		return url;
	}

	function toggleSpin(): boolean {
		controls.autoRotate = !controls.autoRotate;
		needsRender = true;
		return controls.autoRotate;
	}

	function setMeasure(state: UniformState) {
		if (!curTorso) return;
		const P = PRODUCTS[state.product];
		const size = (P.sizes.find(s => s[0] === 'M') || P.sizes[0])[0];
		const [, pl, lb] = P.sizes.find(s => s[0] === size) || ['', null, null];

		if (!pl || !state.measureOn) {
			if (measureGroup) {
				scene.remove(measureGroup);
				measureGroup = null;
				measureKey = '';
				needsRender = true;
			}
			return;
		}

		const col = P.collar === 'shirt' ? '#e53935' : lum(state.look[state.product].body) < 0.06 ? '#f4f4f0' : '#141414';
		const narrow = camera.aspect < 0.95;
		const key = [state.measureOn, curPid, size, col, narrow].join('|');
		if (key === measureKey) return;
		measureKey = key;

		if (measureGroup) {
			scene.remove(measureGroup);
			measureGroup = null;
		}

		const g = new THREE.Group(),
			mat = new THREE.MeshBasicMaterial({ color: col }),
			z = 0.3;
		const dashes = (a: number[], b: number[]) => {
			const A = new THREE.Vector3(...a),
				d = new THREE.Vector3(...b).sub(A),
				len = d.length();
			d.normalize();
			const dl = 0.024,
				gap = 0.015,
				n = Math.floor(len / (dl + gap));
			const im = new THREE.InstancedMesh(dashGeo, mat, n),
				q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), d),
				m = new THREE.Matrix4();
			for (let i = 0; i < n; i++) {
				m.compose(
					A.clone().addScaledVector(d, i * (dl + gap) + dl / 2),
					q,
					new THREE.Vector3(dl, 0.0095, 0.003)
				);
				im.setMatrixAt(i, m);
			}
			g.add(im);
		};

		const label = (text: string, x: number, y: number, align: CanvasTextAlign) => {
			const c = document.createElement('canvas');
			c.width = 640;
			c.height = 128;
			const k = c.getContext('2d')!;
			k.font = '600 66px "Instrument Sans", "Segoe UI", Arial, sans-serif';
			k.fillStyle = col;
			k.textBaseline = 'middle';
			k.textAlign = align;
			k.fillText(text, align === 'right' ? 630 : align === 'left' ? 10 : 320, 66);
			const t = new THREE.CanvasTexture(c);
			t.colorSpace = THREE.SRGBColorSpace;
			const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true }));
			sp.scale.set(0.5, 0.1, 1);
			sp.position.set(x + (align === 'right' ? -0.25 : align === 'left' ? 0.25 : 0), y, z);
			g.add(sp);
		};

		const yL = 0.47,
			xR = 0.47,
			xP = -0.12,
			yTop = 0.555,
			yBot = -0.81;
		dashes([-xR, yL, z], [xR, yL, z]);
		dashes([xP, yTop, z], [xP, yBot, z]);

		if (narrow) label(`Lebar ${lb} cm`, -xR, yL + 0.12, 'left');
		else label(`Lebar ${lb} cm`, -xR - 0.04, yL, 'right');
		label(`Panjang ${pl} cm · ${size}`, xP, yBot - 0.08, 'center');

		scene.add(g);
		measureGroup = g;
		needsRender = true;
	}

	function loop(now: number) {
		animFrameId = requestAnimationFrame(loop);
		if (document.hidden) return;
		if (camAnim) {
			const f = clamp((now - camAnim.t0) / camAnim.dur, 0, 1),
				e = f < 0.5 ? 4 * f * f * f : 1 - Math.pow(-2 * f + 2, 3) / 2;
			const sp = new THREE.Spherical(
				lerp(camAnim.s0.radius, camAnim.s1.radius, e),
				lerp(camAnim.s0.phi, camAnim.s1.phi, e),
				camAnim.s0.theta + camAnim.dT * e
			);
			camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(sp));
			if (f >= 1) camAnim = null;
			needsRender = true;
		}
		const moved = controls.update();
		if (moved || needsRender) {
			renderer.render(scene, camera);
			needsRender = false;
		}
	}

	animFrameId = requestAnimationFrame(loop);

	return {
		buildShirt,
		applyWeave,
		paintAll,
		setView,
		takeSnapshot,
		toggleSpin,
		setMeasure,
		resize,
		destroy() {
			cancelAnimationFrame(animFrameId);
			ro.disconnect();
			disposeShirt();
			renderer.dispose();
		}
	};
}
