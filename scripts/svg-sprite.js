import {
	existsSync,
	mkdirSync,
	readFileSync,
	statSync,
	writeFileSync,
} from 'node:fs';

import { join, resolve } from 'node:path';

import { glob } from 'glob';

import SVGSpriter from 'svg-sprite';

// Vite-плагин для SVG-спрайта.
//
// Для всех файлов src/assets/svg/sprite/** создаёт stack-спрайт
// public/assets/svg/sprite/sprite.svg. Из иконок вырезаются fill/stroke/style —
// цвет задаётся через CSS (currentColor).
//
// Инкрементальность по mtime: спрайт перегенерируется только если хоть один
// исходник новее существующего sprite.svg. В dev — watch на
// src/assets/svg/sprite/ с cooldown-дедупликацией.

export function svgSpritePlugin({
	root,
	srcDir = 'src/assets/svg/sprite',
	outDir = 'public/assets/svg/sprite',
	filename = 'sprite.svg',
	createExample = false,
	svgoOptions = {
		js2svg: { pretty: true },
		plugins: [
			{
				name: 'removeViewBox',
				active: false,
			},
			{
				name: 'removeAttrs',
				params: {
					attrs: ['fill', 'stroke', 'style'],
				},
			},
		],
	},
} = {}) {
	const srcAbs = resolve(root, srcDir);
	const outAbs = resolve(root, outDir);
	const spritePath = join(outAbs, filename);

	let cooldownTimer = null;
	let running = null;

	async function generate() {
		if (running) return running;

		running = (async () => {
			const start = Date.now();
			const files = await glob('**/*.svg', {
				cwd: srcAbs,
				absolute: true,
				nodir: true,
				dot: true,
			});

			if (files.length === 0) {
				console.log('[svg-sprite] нет SVG файлов для обработки');
				return;
			}

			// Инкрементальность: пересобираем только если кто-то из исходников
			// новее существующего спрайта
			if (existsSync(spritePath)) {
				const spriteMtime = statSync(spritePath).mtimeMs;
				const stale = files.filter(
					file => statSync(file).mtimeMs > spriteMtime,
				);
				if (stale.length === 0) {
					console.log(
						`[svg-sprite] обработано: 0/${files.length} (${Date.now() - start}ms), спрайт актуален`,
					);
					return;
				}
			}

			const spriter = new SVGSpriter({
				dest: outAbs,
				mode: {
					stack: {
						sprite: filename,
						example: createExample,
					},
				},
				shape: {
					transform: [{ svgo: svgoOptions }],
				},
			});

			for (const file of files) {
				let fileContent = readFileSync(file, 'utf-8');
				const fileName = file.replace(/\\/g, '/').split('/').pop();

				// Очистка атрибутов (цвета задаются через CSS)
				fileContent = fileContent.replace(
					/\s+(fill|stroke|style)=["'][^"']*["']/g,
					'',
				);
				fileContent = fileContent.replace(/&gt;/g, '>');

				spriter.add(file, fileName, fileContent);
			}

			await new Promise((resolveCompile, rejectCompile) => {
				spriter.compile((error, result) => {
					if (error) {
						rejectCompile(error);
						return;
					}

					try {
						if (!existsSync(outAbs)) {
							mkdirSync(outAbs, { recursive: true });
						}
						writeFileSync(spritePath, result.stack.sprite.contents);
						console.log(`[svg-sprite] спрайт создан: ${spritePath}`);

						if (createExample && result.stack.example) {
							const examplePath = join(outAbs, 'sprite-demo.html');
							writeFileSync(examplePath, result.stack.example.contents);
							console.log(`[svg-sprite] демо-страница создана: ${examplePath}`);
						}

						console.log(
							`[svg-sprite] обработано: ${files.length}/${files.length} (${Date.now() - start}ms) -> public/assets/svg/sprite/`,
						);
						resolveCompile();
					} catch (err) {
						rejectCompile(err);
					}
				});
			});
		})();

		try {
			return await running;
		} finally {
			running = null;
		}
	}

	function scheduleRun() {
		clearTimeout(cooldownTimer);
		cooldownTimer = setTimeout(() => {
			cooldownTimer = null;
			generate();
		}, 200);
	}

	function isInSrc(filePath) {
		return filePath.startsWith(srcAbs);
	}

	return {
		name: 'evkarn-svg-sprite-plugin',
		async buildStart() {
			if (this.meta.watchMode) return;
			await generate();
		},
		configureServer(server) {
			generate();

			server.watcher.on('add', filePath => {
				if (isInSrc(filePath)) scheduleRun();
			});
			server.watcher.on('change', filePath => {
				if (isInSrc(filePath)) scheduleRun();
			});
			server.watcher.on('unlink', filePath => {
				if (isInSrc(filePath)) scheduleRun();
			});
		},
	};
}
