import { getCollection, type CollectionEntry } from 'astro:content';

// Plain copies of each post for Medium and LLMs: absolute PNG URLs, no blog-only fence options.
const images = import.meta.glob<{ default: ImageMetadata }>('/src/content/blog/**/*.{png,jpg,jpeg,gif}', { eager: true });

export const plainPaths = async () =>
	(await getCollection('blog')).map((post) => ({ params: { slug: post.id }, props: { post } }));

export function plainMarkdown(post: CollectionEntry<'blog'>, site: URL) {
	const page = new URL(`/blog/${post.id}/`, site).href;
	const abs = (ref: string) => {
		const file = images[`/src/content/blog/${post.id}/${ref.replace(/^\.\//, '')}`];
		return file ? new URL(file.default.src, site).href : ref;
	};
	const body = (post.body ?? '')
		.split(/^(```[^\n]*\n[\s\S]*?^```)/m)
		.map((part, i) =>
			i % 2
				? part.replace(/^```(\S*)[^\n]*/, '```$1')
				: part.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (m, alt, ref) => (ref.includes('://') ? m : `![${alt}](${abs(ref)})`)),
		)
		.join('')
		.trim();
	const { title, description, hero, hero_alt } = post.data;
	const heroImage = hero ? `![${hero_alt}](${new URL(hero.src, site).href})` : '';
	return { page, title, description, heroImage, body, footer: `*Originally published at [${page}](${page}).*` };
}
