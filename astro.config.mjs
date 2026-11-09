// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import { codeTheme, codeTitle, terminal } from './src/code-theme.mjs';

// https://astro.build/config
export default defineConfig({
	site: 'https://eliasecchig.github.io',
	integrations: [mdx(), sitemap()],
	markdown: { shikiConfig: { theme: codeTheme, transformers: [codeTitle, terminal] } },
});
