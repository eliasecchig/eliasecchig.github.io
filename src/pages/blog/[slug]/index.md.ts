import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';

// The plain-markdown copy of each post, for Medium imports and LLMs: absolute PNG URLs, no blog-only fence options.
const images = import.meta.glob<{ default: ImageMetadata }>('/src/content/blog/**/*.{png,jpg,jpeg,gif}', { eager: true });

export const getStaticPaths: GetStaticPaths = async () =>
	(await getCollection('blog')).map((post) => ({ params: { slug: post.id }, props: { post } }));

export const GET: APIRoute = ({ props, site }) => {
	const post = (props as { post: CollectionEntry<'blog'> }).post;
	const page = new URL(`/blog/${post.id}/`, site);
	const abs = (ref: string) => {
		const file = images[`/src/content/blog/${post.id}/${ref.replace(/^\.\//, '')}`];
		return file ? new URL(file.default.src, site).href : ref;
	};
	const parts = (post.body ?? '').split(/^(```[^\n]*\n[\s\S]*?^```)/m);
	const body = parts
		.map((part, i) =>
			i % 2
				? part.replace(/^```(\S*)[^\n]*/, '```$1')
				: part.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (m, alt, ref) => (ref.includes('://') ? m : `![${alt}](${abs(ref)})`)),
		)
		.join('');
	const { title, description, hero, hero_alt } = post.data;
	const head = [`# ${title}`, `*${description}*`];
	if (hero) head.push(`![${hero_alt}](${new URL(hero.src, site).href})`);
	const text = [...head, body.trim(), `*Originally published at [${page.href}](${page.href}).*`].join('\n\n') + '\n';
	return new Response(text, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
};
