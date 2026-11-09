import type { APIRoute, GetStaticPaths } from 'astro';
import { plainMarkdown, plainPaths } from '../../../lib/plain-post';

export const getStaticPaths: GetStaticPaths = plainPaths;

export const GET: APIRoute = ({ props, site }) => {
	const p = plainMarkdown(props.post, site!);
	const text = [`# ${p.title}`, `*${p.description}*`, p.heroImage, p.body, p.footer].filter(Boolean).join('\n\n') + '\n';
	return new Response(text, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
};
