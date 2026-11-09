// Copyright 2026 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Code colours come from CSS variables (--code-*), set in global.css.
import { createCssVariablesTheme } from 'shiki';

export const codeTheme = createCssVariablesTheme({ name: 'google-devsite', variablePrefix: '--code-', fontStyle: true });

// A fence like ```bash title="install.sh" puts the title on <pre data-title>; site.ts renders it.
export const codeTitle = {
	name: 'code-title',
	pre(node) {
		const meta = this.options.meta?.__raw ?? '';
		const match = meta.match(/title=(?:"([^"]*)"|'([^']*)')/);
		if (match) node.properties['data-title'] = match[1] ?? match[2];
	},
};

// ```console blocks render as a terminal: "$ " lines and their "\" continuations are commands,
// "..." lines are cuts, {2,4-5} in the meta highlights lines, and `static` turns off the typing animation.
const span = (cls, value) => ({ type: 'element', tagName: 'span', properties: { class: cls }, children: [{ type: 'text', value }] });

export const terminal = {
	name: 'terminal',
	preprocess(code, options) {
		if (options.lang !== 'console') return;
		const meta = options.meta?.__raw ?? '';
		const range = meta.match(/\{([\d,\s-]+)\}/)?.[1] ?? '';
		const hl = new Set(range.split(',').flatMap((part) => {
			const [a, b = a] = part.trim().split('-').map(Number);
			return a ? Array.from({ length: b - a + 1 }, (_, i) => a + i) : [];
		}));
		let continued = false;
		const kinds = code.replace(/\n$/, '').split('\n').map((text) => {
			const cmd = text.startsWith('$ ') || continued;
			continued = cmd && text.trimEnd().endsWith('\\');
			return { text, kind: cmd ? 't-cmd' : text.trim() === '...' ? 't-elide' : 't-out' };
		});
		this.meta.terminal = { hl, kinds, static: /(^|\s)static(\s|$)/.test(meta) };
	},
	line(node, n) {
		const t = this.meta.terminal;
		if (!t) return;
		const { text, kind } = t.kinds[n - 1] ?? { text: '', kind: 't-out' };
		node.children = text.startsWith('$ ')
			? [{ ...span('t-prompt', '$ '), properties: { class: 't-prompt', 'aria-hidden': 'true' } }, span('t-text', text.slice(2))]
			: [span('t-text', text)];
		this.addClassToHast(node, kind);
		if (t.hl.has(n)) this.addClassToHast(node, 't-hl');
	},
	pre(node) {
		const t = this.meta.terminal;
		if (!t) return;
		this.addClassToHast(node, 'terminal');
		if (t.static) node.properties['data-static'] = '';
	},
};
