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

// Theme toggle, code titles and copy buttons.
const root = document.documentElement;
const media = matchMedia('(prefers-color-scheme: dark)');

function applyTheme(theme: string) {
	if (theme === 'dark') root.dataset.theme = 'dark';
	else delete root.dataset.theme;
	document.querySelector('[data-theme-toggle]')?.setAttribute('aria-pressed', String(theme === 'dark'));
}

applyTheme(root.dataset.theme ?? 'light');
document.querySelector('[data-theme-toggle]')?.addEventListener('click', () => {
	const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
	localStorage.setItem('theme', next);
	applyTheme(next);
});
// Without a saved choice, follow the system.
media.addEventListener('change', (e) => {
	if (!localStorage.getItem('theme')) applyTheme(e.matches ? 'dark' : 'light');
});

document.querySelectorAll<HTMLElement>('.prose pre.astro-code').forEach((pre) => {
	const wrap = document.createElement('div');
	wrap.className = 'code-wrap';
	pre.replaceWith(wrap);
	const title = pre.dataset.title;
	if (title) {
		const bar = document.createElement('div');
		bar.className = 'code-title';
		bar.textContent = title;
		wrap.before(bar);
	}
	wrap.append(pre);
	const button = document.createElement('button');
	button.className = 'copy-code';
	button.type = 'button';
	button.textContent = 'Copy';
	button.addEventListener('click', async () => {
		await navigator.clipboard.writeText(pre.innerText.trimEnd());
		button.textContent = 'Copied';
		setTimeout(() => (button.textContent = 'Copy'), 1500);
	});
	wrap.append(button);
});
