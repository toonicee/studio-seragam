/** Unggahan gambar: dibaca ulang dengan sharp (buang EXIF/GPS), diperkecil, disimpan sebagai WebP di DATA_DIR/uploads */
import { randomBytes } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve, sep } from 'node:path';
import sharp from 'sharp';
import { dataDir } from '../db';
import { ShopError } from './orders';

const MAX_BYTES = 8 * 1024 * 1024;

/** `public/*` boleh diakses siapa saja lewat /shop/media; `proofs` hanya admin & pemilik pesanan */
const DIRS = {
	products: 'public/products',
	qris: 'public/qris',
	proofs: 'proofs'
} as const;
export type UploadKind = keyof typeof DIRS;

export const uploadsRoot = () => join(dataDir(), 'uploads');

export async function processImage(input: Buffer, maxSize: number) {
	try {
		return await sharp(input, { failOn: 'error', limitInputPixels: 50_000_000 })
			.rotate()
			.resize({ width: maxSize, height: maxSize, fit: 'inside', withoutEnlargement: true })
			.webp({ quality: 82 })
			.toBuffer();
	} catch {
		throw new ShopError('File bukan gambar yang valid. Gunakan JPG, PNG, atau WebP.');
	}
}

export async function saveBuffer(buf: Buffer, kind: UploadKind, prefix = '') {
	const name = `${prefix ? prefix + '-' : ''}${Date.now().toString(36)}-${randomBytes(4).toString('hex')}.webp`;
	const rel = `${DIRS[kind]}/${name}`;
	const abs = join(uploadsRoot(), rel);
	await mkdir(dirname(abs), { recursive: true });
	await writeFile(abs, buf);
	return rel;
}

/** Simpan file dari form. Mengembalikan path relatif terhadap DATA_DIR/uploads */
export async function saveImage(
	file: unknown,
	kind: UploadKind,
	opts: { maxSize?: number; prefix?: string } = {}
): Promise<string> {
	if (!(file instanceof File) || file.size === 0) throw new ShopError('Pilih file gambar terlebih dahulu.');
	if (file.size > MAX_BYTES) throw new ShopError('Ukuran file maksimal 8 MB.');
	const out = await processImage(Buffer.from(await file.arrayBuffer()), opts.maxSize ?? 1600);
	return saveBuffer(out, kind, opts.prefix);
}

/** URL publik untuk file di uploads/public */
export const mediaUrl = (rel: string) => '/shop/media/' + rel.replace(/^public\//, '');

/** Path absolut yang aman (tidak keluar dari folder unggahan) */
export function resolveUpload(rel: string, publicOnly: boolean): string | null {
	const root = resolve(uploadsRoot(), publicOnly ? 'public' : '.');
	const abs = resolve(root, rel);
	if (!abs.startsWith(root + sep)) return null;
	return abs;
}

export async function readUpload(rel: string, publicOnly: boolean) {
	const abs = resolveUpload(rel, publicOnly);
	if (!abs) return null;
	try {
		return await readFile(abs);
	} catch {
		return null;
	}
}

export function imageResponse(buf: Buffer, cache: string) {
	return new Response(new Uint8Array(buf), {
		headers: {
			'content-type': 'image/webp',
			'cache-control': cache,
			'x-content-type-options': 'nosniff'
		}
	});
}
