import { statSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';

import { dirname, extname, join, relative } from 'node:path';

import { glob } from 'glob';

import sharp from 'sharp';

// Vite-плагин для картинок (аналог gulp-imgMin).
//
// Для каждого файла src/assets/images/** создаёт в public/assets/images/:
//   1. оптимизированный оригинал (jpg/png/webp/avif — пересборка через sharp,
//      gif/tiff/bmp/ico и прочее — копия как есть);
//   2. копию .webp (quality 80);
//   3. копию .avif (quality 80).
//
// URL-структура /assets/images/... сохраняется: public/ отдаётся Vite как есть
// в dev и копируется в dist при сборке.
//
// Инкрементальность по mtime: файл переобрабатывается только если какого-то
// из целевых выходных файлов нет или он старше исходника (как в copy-images.mjs).
// В dev — watch на src/assets/images/ с cooldown-дедупликацией.

const WEBP_QUALITY = 80;
const AVIF_QUALITY = 80;

const IMAGE_RE = /\.(jpe?g|png|webp|avif|tif{1,2}|gif)$/i;

const SKIP_FILES = new Set(['.gitkeep', '.DS_Store', 'Thumbs.db']);

// Пересборка оптимизированных оригиналов (ключ = расширение без точки)
const ORIGINAL_ENCODERS = {
	jpg: img => img.jpeg({ quality: 82, mozjpeg: true, progressive: true }),
	jpeg: img => img.jpeg({ quality: 82, mozjpeg: true, progressive: true }),
	png: img => img.png({ compressionLevel: 9, adaptiveFiltering: true }),
	webp: img => img.webp({ quality: 85 }),
	avif: img => img.avif({ quality: 70 }),
};

const COPY_AS_IS = new Set(['.gif', '.tif', '.tiff', '.bmp', '.ico']);

export function imagePlugin({
	root,
	srcDir = 'src/assets/images',
	outDir = 'public/assets/images',
} = {}) {
	const srcAbs = join(root, srcDir);
	const outAbs = join(root, outDir);

	let cooldownTimer = null;
	let running = null;

	function isFresh(srcPath, outPath) {
		if (!existsSync(outPath)) return false;
		return statSync(srcPath).mtimeMs <= statSync(outPath).mtimeMs;
	}

	async function processFile(file) {
		const rel = relative(srcAbs, file);
		const ext = extname(file).toLowerCase();

		if (SKIP_FILES.has(rel) || !IMAGE_RE.test(rel)) return false;

		const base = rel.slice(0, -extname(rel).length);
		const dirOut = join(outAbs, dirname(rel));
		const outOriginal = join(outAbs, rel);
		const outWebp = join(outAbs, `${base}.webp`);
		const outAvif = join(outAbs, `${base}.avif`);

		// Целевые выходные файлы этого исходника
		const targets = [outOriginal];
		if (ext !== '.webp') targets.push(outWebp);
		if (ext !== '.avif') targets.push(outAvif);

		if (targets.every(target => isFresh(file, target))) return false;

		mkdirSync(dirOut, { recursive: true });

		// Форматы без пересборки — копируем оригинал как есть (без webp/avif)
		if (COPY_AS_IS.has(ext) || !ORIGINAL_ENCODERS[ext.slice(1)]) {
			copyFileSync(file, outOriginal);
			return true;
		}

		try {
			const { data } = await sharp(file, { failOn: 'none' })
				.rotate()
				.toBuffer({ resolveWithObject: true });

			await ORIGINAL_ENCODERS[ext.slice(1)](sharp(data)).toFile(outOriginal);

			if (ext !== '.webp') {
				await sharp(data).webp({ quality: WEBP_QUALITY }).toFile(outWebp);
			}

			if (ext !== '.avif') {
				await sharp(data).avif({ quality: AVIF_QUALITY }).toFile(outAvif);
			}
		} catch (error) {
			// Некорректный/сложный файл — отдаём оригинал как есть, без webp/avif
			// (повторная попытка не нужна: mtime исходника не менялся)
			console.warn(
				`[image-plugin] пропущена обработка ${rel}: ${error.message}`,
			);
			copyFileSync(file, outOriginal);
		}

		return true;
	}

	async function run() {
		if (running) return running;

		running = (async () => {
			const start = Date.now();
			const files = await glob('**/*', {
				cwd: srcAbs,
				absolute: true,
				nodir: true,
				dot: true,
			});

			let converted = 0;
			for (const file of files) {
				if (await processFile(file)) converted++;
			}

			console.log(
				`[image-plugin] обработано: ${converted}/${files.length} (${Date.now() - start}ms) -> public/assets/images/`,
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
		name: 'evkarn-image-plugin',
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
		},
	};
}
