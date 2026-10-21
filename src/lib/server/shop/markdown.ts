/** Markdown halaman info (ditulis admin). HTML mentah dibuang dan hanya link aman yang dipakai. */
import { Marked, type Tokens } from 'marked';

const SAFE_HREF = /^(https?:\/\/|mailto:|tel:|\/|#)/i;

const md = new Marked({
	gfm: true,
	renderer: {
		html: () => '',
		image: ({ text }: Tokens.Image) => text,
		link(token: Tokens.Link) {
			const inner = this.parser.parseInline(token.tokens);
			if (!SAFE_HREF.test(token.href)) return inner;
			const external = /^https?:\/\//i.test(token.href);
			const href = token.href.replace(/"/g, '&quot;');
			return `<a href="${href}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${inner}</a>`;
		}
	}
});

export function renderMarkdown(src: string): string {
	return md.parse(src, { async: false }) as string;
}
