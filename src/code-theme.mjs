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
