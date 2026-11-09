import type { APIRoute, GetStaticPaths } from 'astro';
import { marked } from 'marked';
import { plainMarkdown, plainPaths } from '../../../lib/plain-post';

// A bare HTML copy for Medium's "Import a story": no scripts, plain <pre> blocks, PNG images.
export const getStaticPaths: GetStaticPaths = plainPaths;

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

export const GET: APIRoute = ({ props, site }) => {
	const p = plainMarkdown(props.post, site!);
	const body = marked.parse([p.heroImage, p.body, p.footer].filter(Boolean).join('\n\n'), { async: false });
	const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(p.title)}</title>
<meta name="description" content="${esc(p.description)}"><link rel="canonical" href="${p.page}">
<meta property="og:title" content="${esc(p.title)}"><meta property="og:description" content="${esc(p.description)}">
<meta name="robots" content="noindex"></head>
<body><article><h1>${esc(p.title)}</h1><h2>${esc(p.description)}</h2>${body}</article></body></html>\n`;
	return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
};
