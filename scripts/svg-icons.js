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

// Vite-плагин для статичных SVG-иконок (аналог gulp-svgmin).
//
// Для каждого файла src/assets/svg/static/** создать в public/assets/svg/static/
// оптимизированную копию (SVGO, multipass, viewBox сохраняется), сохраняя
// структуру подпапок. URL-структура /assets/svg/static/... сохраняется:
// public/ отдаётся Vite как есть в dev и копируется в dist при сборке.
//
// Инкрементальность по mtime: иконка переобрабатывается только если выходного
// файла нет или он старше исходника. В dev — watch на src/assets/svg/static/
// с cooldown-дедупликацией.

const SKIP_FILES = new Set(['.gitkeep', '.DS_Store', 'Thumbs.db']);

function formatFileSize(bytes) {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function svgIconsPlugin({
	root,
	srcDir = 'src/assets/svg/static',
	outDir = 'public/assets/svg/static',
	svgoOptions = {
		multipass: true,
		plugins: [
			{
				name: 'removeViewBox',
				active: false, // Оставляем viewBox
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
					`[svg-icons] SVGO вернул пустой результат для ${rel}, используем исходный`,
				);
			}
		} catch (error) {
			console.warn(
				`[svg-icons] ошибка SVGO для ${rel}: ${error.message}, используем исходный`,
			);
		}

		writeFileSync(outPath, optimizedContent, 'utf-8');

		const optimizedSize = statSync(outPath).size;
		const saved = originalSize - optimizedSize;
		const percent =
			originalSize > 0 ? ((saved / originalSize) * 100).toFixed(1) : '0';

		console.log(
			`[svg-icons] • ${rel}: ${formatFileSize(originalSize)} → ${formatFileSize(optimizedSize)} (${percent}%)`,
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
				console.log('[svg-icons] нет SVG иконок для обработки');
				return;
			}

			let optimized = 0;
			for (const file of files) {
				if (await processFile(file)) optimized++;
			}

			console.log(
				`[svg-icons] обработано: ${optimized}/${files.length} (${Date.now() - start}ms) -> public/assets/svg/static/`,
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
		name: 'evkarn-svg-icons-plugin',
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
