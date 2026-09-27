import { fileURLToPath, URL } from 'node:url';

import { extname, isAbsolute, relative, sep } from 'node:path';

import { loadEnv } from 'vite';
import { fileIncludePlugin } from './scripts/file-include-plugin.js';
import { normalizeAssetUrlsPlugin } from './scripts/normalize-asset-urls.js';
import { imagePlugin } from './scripts/image-plugin.js';
import { svgIconsPlugin } from './scripts/svg-icons.js';
import { svgSpritePlugin } from './scripts/svg-sprite.js';
import { htmlMinifyPlugin } from './scripts/html-minify-plugin.js';
import { typografPlugin } from './scripts/typograf-plugin.js';

// Алиасы путей
export const jsAliases = {
	'@': 'src',
	'@elements': 'src/elements',
	'@funcs': 'src/js/functions',
	'@utils': 'src/js/utils',
	'@modules': 'src/js/modules',
	'@constants': 'src/js/constants',
	'@styles': 'src/styles/scss',
	'@js': 'src/js',
};

// Корень проекта (как import.meta.dirname, доступен с Node 20.11)
const rootDir = fileURLToPath(new URL('.', import.meta.url));

// Корень Vite (root: 'src') — относительно него сохраняем структуру ассетов
const viteRoot = fileURLToPath(new URL('./src', import.meta.url));

// Расширения, для которых сохраняем исходную структуру папок.
// Всё остальное (css/js-чанки, файлы из node_modules) получает
// стандартное assets/[name]-[hash].[ext].
const KEEP_STRUCTURE_EXT = new Set([
	'.jpg',
	'.jpeg',
	'.png',
	'.webp',
	'.avif',
	'.gif',
	'.svg',
	'.ico',
	'.bmp',
	'.tif',
	'.tiff',
	'.woff',
	'.woff2',
	'.ttf',
	'.otf',
	'.eot',
	'.mp4',
	'.webm',
	'.mp3',
	'.wav',
	'.pdf',
]);

/**
 * Ассет кладём в dist по тому же пути, что он лежит внутри root.
 * Так dist/assets/images/about/img-about.jpg совпадает с тем, что написано
 * в разметке, и вложенность не теряется (дефолт Vite схлопывает всё в
 * assets/[name]-[hash].[ext]).
 *
 * @param {import('rolldown').AssetInfo} info
 * @returns {string}
 */
function assetFileName(info) {
	const original = info.originalFileNames?.[0];

	// Vite вызывает эту функцию и для внутреннего имени css-чанка
	// (originalFileNames пуст) — отдаём стандартный путь.
	if (!original || !KEEP_STRUCTURE_EXT.has(extname(original).toLowerCase())) {
		return 'assets/[name]-[hash][extname]';
	}

	// originalFileNames приходит уже от-relative к root (assets/images/...);
	// абсолютные пути на всякий случай приводим к тому же виду
	const rel = isAbsolute(original)
		? relative(viteRoot, original).split(sep).join('/')
		: original.split(sep).join('/');

	// Файл вне root (например, из node_modules) — структуру не сохраняем
	if (!rel || rel.startsWith('..'))
		return 'assets/vendor/[name]-[hash][extname]';

	return rel;
}

const env = loadEnv(process.env.NODE_ENV || 'development', rootDir, '');

const plugins = [
	fileIncludePlugin({ root: rootDir }),
	// Обязательно после fileIncludePlugin: нормализует уже развёрнутые
	// @include, до того как Vite начнёт резолвить ассеты.
	normalizeAssetUrlsPlugin(),
	imagePlugin({ root: rootDir }),
	svgIconsPlugin({ root: rootDir }),
	svgSpritePlugin({ root: rootDir }),
];

if (env.HTML_MINIFY !== 'false') {
	plugins.push(htmlMinifyPlugin());
}

plugins.push(typografPlugin());

export default {
	root: 'src',
	base: './',
	publicDir: '../public',
	plugins,
	server: {
		port: 3000,
	},
	css: {
		devSourcemap: true,
		preprocessorOptions: {
			scss: {
				api: 'modern-compiler',
				loadPaths: [
					'src',
					'src/elements',
					'src/styles/scss',
					'src/styles/scss/vars',
					'node_modules',
				],
			},
		},
	},
	resolve: {
		alias: Object.fromEntries(
			Object.entries(jsAliases).map(([alias, target]) => [
				alias,
				fileURLToPath(new URL(`./${target}`, import.meta.url)),
			]),
		),
	},
	build: {
		outDir: '../dist',
		emptyOutDir: true,
		sourcemap: false,
		// Не инлайнить ассеты (<img src="..."> в HTML, svg) в data-URI —
		// отдавать файлами (картинки/логотипы не раздувают HTML)
		assetsInlineLimit: 0,
		rollupOptions: {
			output: {
				assetFileNames: assetFileName,
			},
		},
		// MPA (доп. страницы): dev-сервер сам отдаёт любой .html из src/,
		// для build добавьте свои страницы сюда:
		// rollupOptions: {
		// 	input: [
		// 		fileURLToPath(new URL('./src/index.html', import.meta.url)),
		// 		fileURLToPath(new URL('./src/about.html', import.meta.url)),
		// 	],
		// },
	},
};
