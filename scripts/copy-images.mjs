import { copyFileSync, existsSync, mkdirSync, statSync } from 'node:fs';

import { dirname, join, relative, resolve } from 'node:path';

import { glob } from 'glob';

// Статичные картинки сайта. В исходнике (Eleventy) они лежали в src/assets/images
// и копировались passthrough в /assets/images/... как есть. В Astro это публичная
// папка public/, поэтому копируем src/assets/images/** → public/assets/images/**
// (URL-структура /assets/images/... сохраняется как в оригинале).
// Исключение: отладочный артефакт svg-sprite sprite.stack.html (lang="en",
// загрязняет поисковый индекс Pagefind) — на сайт не копируется.

const SRC_DIR = resolve(process.cwd(), 'src/assets/images');
const OUT_DIR = resolve(process.cwd(), 'public/assets/images');

const SKIP_SUFFIXES = ['sprite.stack.html'];

async function copyImages() {
	const files = await glob('**/*', {
		cwd: SRC_DIR,
		absolute: true,
		nodir: true,
		dot: true,
	});

	let copied = 0;
	for (const file of files) {
		if (SKIP_SUFFIXES.some(suffix => file.endsWith(suffix))) {
			continue;
		}
		const rel = relative(SRC_DIR, file);
		const out = join(OUT_DIR, rel);
		if (existsSync(out) && statSync(file).mtimeMs <= statSync(out).mtimeMs) {
			continue;
		}
		mkdirSync(dirname(out), { recursive: true });
		copyFileSync(file, out);
		copied++;
	}

	console.log(
		`[copy-images] скопировано: ${copied} файлов (всего: ${files.length}) -> public/assets/images/`,
	);
}

copyImages();
