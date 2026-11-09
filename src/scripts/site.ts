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
	if (pre.classList.contains('terminal')) {
		const bar = document.createElement('div');
		bar.className = 'term-bar';
		bar.innerHTML = '<span class="term-dots" aria-hidden="true"><i></i><i></i><i></i></span>';
		const label = document.createElement('span');
		label.className = 'term-title';
		label.textContent = title ?? 'Terminal';
		bar.append(label);
		wrap.prepend(bar);
	} else if (title) {
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
		await navigator.clipboard.writeText(pre.classList.contains('terminal') ? terminalCommands(pre) : pre.innerText.trimEnd());
		button.textContent = 'Copied';
		setTimeout(() => (button.textContent = 'Copy'), 1500);
	});
	wrap.append(button);
	if (pre.classList.contains('terminal')) animateTerminal(pre);
});

// Copy only the commands of a terminal block, without the "$ " prompt or the output.
function terminalCommands(pre: HTMLElement): string {
	return [...pre.querySelectorAll<HTMLElement>('.line.t-cmd .t-text')]
		.map((el) => el.dataset.full ?? el.textContent ?? '')
		.join('\n')
		.trim();
}

// Type each command, then show its output, the first time the block scrolls into view.
function animateTerminal(pre: HTMLElement) {
	if (pre.hasAttribute('data-static') || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
	const lines = [...pre.querySelectorAll<HTMLElement>('.line')];
	lines.forEach((line) => {
		const text = line.querySelector<HTMLElement>('.t-text');
		if (text) text.dataset.full = text.textContent ?? '';
		line.classList.add('t-pending');
	});
	const observer = new IntersectionObserver(async ([entry]) => {
		if (!entry.isIntersecting) return;
		observer.disconnect();
		pre.classList.add('t-playing');
		for (const line of lines) {
			const text = line.querySelector<HTMLElement>('.t-text');
			line.classList.remove('t-pending');
			if (line.classList.contains('t-cmd') && text) {
				const full = text.dataset.full ?? '';
				const step = Math.max(1, Math.ceil(full.length / 45));
				for (let i = 0; i <= full.length; i += step) {
					text.textContent = full.slice(0, i);
					await new Promise((r) => setTimeout(r, 18));
				}
				text.textContent = full;
				await new Promise((r) => setTimeout(r, 220));
			} else {
				await new Promise((r) => setTimeout(r, 45));
			}
		}
		pre.classList.remove('t-playing');
	}, { threshold: 0.4 });
	observer.observe(pre);
}
