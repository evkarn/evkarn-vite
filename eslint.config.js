// Конфигурация ESLint (flat config).
//
// Запуск: npm run lint:js (проверка) / npm run lint:js:fix (исправление).
//
// Разделение по окружениям:
//   src/**            — браузерный код (window, document и т.д.)
//   vite.config.js /
//   postcss.config.js / scripts/** — Node-код сборки
//                    (process, fs, vite-хуки).
//
// Код в src исторический: часть замечаний там переведена в предупреждения,
// чтобы npm run lint не падал, но все проблемные места остаются видны.
import { defineConfig } from 'eslint/config';

import globals from 'globals';

import js from '@eslint/js';

// Готовый набор: плагин prettier + правило prettier/prettier +
// отключение конфликтующих правил eslint
import prettierRecommended from 'eslint-plugin-prettier/recommended';

// Что не проверяем:
//   dist/**, public/**, temp/ — результат сборки, генерируемые ассеты;
//   src/js/** — всё, кроме точки входа scripts.js: папка functions —
//               личный архив сниппетов, который постоянно допиливается,
//               часть файлов там сознательно не является валидным JS.
const ignores = {
	ignores: [
		'dist/**',
		'public/**',
		'temp/**',
		'src/js/**',
		'!src/js/scripts.js',
	],
};

// Общие правила поверх базовых наборов
const rules = {
	rules: {
		'no-var': 'warn',
		'prefer-const': 'warn',
		'prettier/prettier': [
			'warn',
			{
				endOfLine: 'auto',
			},
		],
	},
};

export default defineConfig([
	ignores,

	{
		files: ['src/**/*.{js,mjs,cjs}'],

		languageOptions: {
			globals: globals.browser,
		},

		extends: [js.configs.recommended, prettierRecommended],

		...rules,

		// Точка входа бандла правится постоянно, в том числе в промежуточном
		// состоянии, поэтому все замечания здесь — предупреждения,
		// чтобы npm run lint не падал посреди работы
		rules: {
			...rules.rules,
			'no-undef': 'warn',
			'no-unused-vars': 'warn',
			'no-redeclare': 'warn',
			'no-useless-escape': 'warn',
			'no-empty': 'warn',
			'no-func-assign': 'warn',
			'no-unassigned-vars': 'warn',
			'no-constant-binary-expression': 'warn',
			'no-self-assign': 'warn',
			'no-useless-assignment': 'warn',
		},
	},

	{
		files: ['vite.config.js', 'postcss.config.js', 'scripts/**/*.{js,mjs}'],

		languageOptions: {
			globals: globals.node,
		},

		extends: [js.configs.recommended, prettierRecommended],

		...rules,
	},
]);
