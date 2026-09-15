import { fileURLToPath, URL } from 'node:url';
import { loadEnv } from 'vite';
import { fileIncludePlugin } from './scripts/file-include-plugin.js';
import { imagePlugin } from './scripts/image-plugin.js';
import { svgIconsPlugin } from './scripts/svg-icons.js';
import { svgSpritePlugin } from './scripts/svg-sprite.js';
import { htmlMinifyPlugin } from './scripts/html-minify-plugin.js';

// Алиасы путей
export const jsAliases = {
	'@': 'src',
	'@components': 'src/components',
	'@funcs': 'src/js/functions',
	'@utils': 'src/js/utils',
	'@modules': 'src/js/modules',
	'@constants': 'src/js/constants',
	'@styles': 'src/styles/scss',
	'@js': 'src/js',
};

// Корень проекта (как import.meta.dirname, доступен с Node 20.11)
const rootDir = fileURLToPath(new URL('.', import.meta.url));

const env = loadEnv(process.env.NODE_ENV || 'development', rootDir, '');

const plugins = [
	fileIncludePlugin({ root: rootDir }),
	imagePlugin({ root: rootDir }),
	svgIconsPlugin({ root: rootDir }),
	svgSpritePlugin({ root: rootDir }),
];

if (env.HTML_MINIFY !== 'false') {
	plugins.push(htmlMinifyPlugin());
}

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
					'src/components',
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
	},
};
