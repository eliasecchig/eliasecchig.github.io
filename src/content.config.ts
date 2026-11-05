import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	// Each post is a folder with index.md and its images beside it.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			date: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			tags: z.array(z.string()).default([]),
			// The next two keep the factory's dedup input with the post; the site does not show them.
			sources: z.array(z.string()).default([]),
			topics: z.array(z.string()).default([]),
			hero: z.optional(image()),
			hero_alt: z.string().default(''),
		}),
});

export const collections = { blog };
