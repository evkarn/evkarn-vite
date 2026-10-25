import {
	existsSync,
	mkdirSync,
	readFileSync,
	statSync,
	writeFileSync,
} from 'node:fs';

import { dirname, join, relative, resolve } from 'node:path';

import { glob } from 'glob';

import { optimize } from 'svgo';

// Vite-плагин для статичных SVG (аналог gulp-svgmin).
//
// Для каждого файла assets/svg/static/** создаёт в src/assets/svg/static/
// оптимизированную копию (SVGO, multipass, viewBox сохраняется), сохраняя
// структуру подпапок. Исходники в assets/ остаются нетронутыми, результат
// лежит внутри root — Vite переносит его в dist по ссылкам из разметки.
//
// Инкрементальность по mtime: файл переобрабатывается только если выходного
// файла нет или он старше исходника. В dev — watch на assets/svg/static/
// с cooldown-дедупликацией.

const SKIP_FILES = new Set(['.gitkeep', '.DS_Store', 'Thumbs.db']);

function formatFileSize(bytes) {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function svgStaticPlugin({
	root,
	srcDir = 'assets/svg/static',
	outDir = 'src/assets/svg/static',
	svgoOptions = {
		multipass: true,
		plugins: [
			{
				name: 'preset-default',
				params: {
					overrides: {
						removeViewBox: false, // Оставляем viewBox
					},
				},
			},
		],
	},
} = {}) {
	const srcAbs = resolve(root, srcDir);
	const outAbs = resolve(root, outDir);

	let cooldownTimer = null;
	let running = null;

	function isFresh(srcPath, outPath) {
		if (!existsSync(outPath)) return false;
		return statSync(srcPath).mtimeMs <= statSync(outPath).mtimeMs;
	}

	async function processFile(file) {
		const rel = relative(srcAbs, file);

		if (SKIP_FILES.has(rel) || !rel.endsWith('.svg')) return false;

		const outPath = join(outAbs, rel);

		if (isFresh(file, outPath)) return false;

		mkdirSync(dirname(outPath), { recursive: true });

		const originalSize = statSync(file).size;
		const originalContent = readFileSync(file, 'utf-8');

		// Ручная очистка — только безопасные замены
		let optimizedContent = originalContent.replace(/&gt;/g, '>');

		// SVGO оптимизация
		try {
			const result = optimize(optimizedContent, svgoOptions);
			if (result && result.data) {
				optimizedContent = result.data;
			} else {
				console.warn(
					`[svg-static] SVGO вернул пустой результат для ${rel}, используем исходный`,
				);
			}
		} catch (error) {
			console.warn(
				`[svg-static] ошибка SVGO для ${rel}: ${error.message}, используем исходный`,
			);
		}

		writeFileSync(outPath, optimizedContent, 'utf-8');

		const optimizedSize = statSync(outPath).size;
		const saved = originalSize - optimizedSize;
		const percent =
			originalSize > 0 ? ((saved / originalSize) * 100).toFixed(1) : '0';

		console.log(
			`[svg-static] • ${rel}: ${formatFileSize(originalSize)} → ${formatFileSize(optimizedSize)} (${percent}%)`,
		);

		return true;
	}

	async function run() {
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
				console.log('[svg-static] нет SVG файлов для обработки');
				return;
			}

			let optimized = 0;
			for (const file of files) {
				if (await processFile(file)) optimized++;
			}

			console.log(
				`[svg-static] обработано: ${optimized}/${files.length} (${Date.now() - start}ms) -> ${outDir}/`,
			);
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
			run();
		}, 200);
	}

	function isInSrc(filePath) {
		return filePath.startsWith(srcAbs);
	}

	return {
		name: 'evkarn-svg-static-plugin',
		async buildStart() {
			if (this.meta.watchMode) return;
			await run();
		},
		configureServer(server) {
			run();

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
