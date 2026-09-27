// Список сниппетов из src/js/functions/ — печать в консоль или обновление
// таблицы в README.
//
// Запуск:
//   npm run js-snippets            — напечатать таблицу (ничего не меняет)
//   npm run js-snippets -- --write — переписать таблицу в README между
//                                    маркерами <!-- js-snippets:start/end -->
//
// Не путать со сниппетами редактора: те лежат в .vscode/*.code-snippets
// (html-*, styles-*, javascript*). Здесь — папки с готовыми UI-решениями.
//
// Категория определяется по имени папки: сработало первое правило, под которое
// подходит имя. Поэтому папку get-*, set-element-*, window-* и т.п. добавлять
// вручную не надо — она попадёт в «Служебные утилиты» сама. Папка, под которую
// не подошло ни одно правило, не теряется: она попадает в строку «Не разбрано».
// Исключения — OVERRIDES (папка → категория в обход правил) и NOTES (пояснения
// в таблице).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	'..',
);
const functionsDir = path.join(rootDir, 'src', 'js', 'functions');
const libsDir = path.join(rootDir, 'src', 'js', 'libs');
const readmePath = path.join(rootDir, 'README.md');

const START_MARKER = '<!-- js-snippets:start -->';
const END_MARKER = '<!-- js-snippets:end -->';

// Правила категоризации. Порядок важен: сработало первое подходящее.
// Например, search-field-google попадёт в «Формы» (правило раньше), а
// search-elements — в «Контент».
const CATEGORIES = [
	{
		title: 'Навигация и меню',
		test: /^(burger|nav-|create-page-nav-|pagination$)/,
	},
	{
		title: 'Модальные окна / лайтбоксы',
		test: /(modal|lightbox|photo-swipe)/,
	},
	{
		title: 'Формы и поля ввода',
		test: /(input|password|select|no-ui-slider|validation|form|search-field)/,
	},
	{
		title: 'Контент / виджеты',
		test: /(spoilers|tabs|ticker|stepper|show-more|search|sorting|filters|rating|quiz|portfolio|counter|read-progress|price|highlight|timer)/,
	},
	{
		title: 'Медиа',
		test: /(video|swiper|slider|image|simple-bar)/,
	},
	{ title: 'Анимация', test: /^(aos|animat)/ },
	// Перед UX: иначе get-scroll-width уедет туда из-за «scroll»
	{
		title: 'Служебные утилиты',
		test: /^(get-|window-|document-|check-|set-(element|min-height))/,
	},
	{
		title: 'UX / скролл и эффекты',
		test: /(top|scroll|slide|tooltip|switch|color-scheme|dynamic|offset)/,
	},
	{
		title: 'Прочее',
		test: /(webp|avif|metrika|cookie|likely|orphus|scheme|open-graph)/,
	},
];

// Папка → категория, если правила ошиблись (правило тоже можно поправить,
// но для одной папки быстрее здесь)
const OVERRIDES = new Map([
	['set-class-when-scrolling', 'UX / скролл и эффекты'],
]);

// Пояснения в скобках после имени папки в таблице
const NOTES = new Map([
	['dynamic-adapt', ' (есть свой README.md)'],
	['simple-bar', ' (кастомный скроллбар)'],
	['orphus', ' (+ PHP)'],
	['scheme-org', ' (schema.org микроданные)'],
	['open-graph', ' (schema.org микроданные)'],
]);

// Сниппеты в работе: в таблице помечаются звёздочкой. Список можно дополнить —
// папка без пометки просто считается готовой, лишних предупреждений не будет.
//
// Чем искать поломки — npm run js-snippets:check. Архив исключён из eslint как
// «намеренно невалидный», поэтому включается флагом --no-ignore.
// Синтаксическая ошибка = Parsing error = файл не запустится вообще; в отличие
// от warnings (в архиве их 300+, это норма) её нельзя понизить до warning:
// не построить AST — не применить ни одного правила. Ловится только синтаксис:
// ReferenceError-ы (несуществующая переменная) и прочие ошибки рантайма
// проверка не видит — они всплывают при вставке в проект.
//
// Сейчас пусто: последняя проверка 27.09.2026 — синтаксических ошибок нет.
const WIP = new Map([
	// ['имя-папки', 'почему в работе: const calcHeight() {} — забыто `=`'],
]);

const WIP_LEGEND =
	'`*` — сниппет в работе, как есть не запустится (причины в `WIP` скрипта `scripts/list-js-snippets.mjs`)';

/** @returns {string[]} папки (не файлы) внутри src/js/functions */
function readFolders(dir) {
	if (!fs.existsSync(dir)) return [];

	return fs
		.readdirSync(dir, { withFileTypes: true })
		.filter(entry => entry.isDirectory())
		.map(entry => entry.name)
		.sort();
}

/** @returns {string} категория папки по имени */
function resolveCategory(folder) {
	const override = OVERRIDES.get(folder);
	if (override) return override;

	const match = CATEGORIES.find(category => category.test.test(folder));
	return match ? match.title : '';
}

function formatList(folders) {
	return folders
		.map(folder => {
			const note = NOTES.get(folder) || '';
			const wip = WIP.has(folder) ? '*' : '';
			return `\`${folder}\`${note}${wip}`;
		})
		.join(', ');
}

/** Таблица + папки, которые не попали ни в одну категорию */
function buildTable() {
	const folders = readFolders(functionsDir);

	// Категории в порядке CATEGORIES, внутри — по алфавиту
	const grouped = new Map(CATEGORIES.map(category => [category.title, []]));
	const unknown = [];

	for (const folder of folders) {
		const category = resolveCategory(folder);

		if (!category) {
			unknown.push(folder);
			continue;
		}

		if (!grouped.has(category)) grouped.set(category, []);
		grouped.get(category).push(folder);
	}

	const rows = [...grouped]
		.filter(([, list]) => list.length)
		.map(([title, list]) => `| ${title} | ${formatList(list)} |`);

	// Вендорные обёртки — отдельная папка, но список тоже ведёт
	const libs = readFolders(libsDir);
	if (libs.length) {
		rows.push(`| Вендорные обёртки (\`src/js/libs/\`) | ${formatList(libs)} |`);
	}

	// Новое и переименованное не должно молча пропасть из README
	if (unknown.length) {
		rows.push(`| Не разбрано (добавить правило) | ${formatList(unknown)} |`);
	}

	const table = ['| Категория | Папки |', '| --- | --- |', ...rows].join('\n');

	return {
		// Легенду добавляем, только если в таблице есть что помечать
		table: folders.some(folder => WIP.has(folder))
			? `${table}\n\n${WIP_LEGEND}`
			: table,
		total: folders.length,
		unknown,
		wip: folders.filter(folder => WIP.has(folder)),
	};
}

function updateReadme(table) {
	if (!fs.existsSync(readmePath)) {
		console.error('[js-snippets] Нет README.md — обновлять нечего');
		process.exitCode = 1;
		return;
	}

	const readme = fs.readFileSync(readmePath, 'utf-8');
	const startAt = readme.indexOf(START_MARKER);
	const endAt = readme.indexOf(END_MARKER);

	if (startAt === -1 || endAt === -1 || endAt < startAt) {
		console.error(
			`[js-snippets] В README нет маркеров ${START_MARKER} / ${END_MARKER}`,
		);
		process.exitCode = 1;
		return;
	}

	const updated = `${readme.slice(0, startAt + START_MARKER.length)}\n\n${table}\n\n${readme.slice(endAt)}`;
	fs.writeFileSync(readmePath, updated, 'utf-8');
	console.log(`✅ README обновлён: ${path.relative(rootDir, readmePath)}`);
}

function main() {
	const { table, total, unknown, wip } = buildTable();
	const write = process.argv.slice(2).includes('--write');

	if (write) {
		updateReadme(table);
	} else {
		console.log(table);
		console.log(`\n[js-snippets] папок в src/js/functions/: ${total}`);
	}

	if (unknown.length) {
		console.warn(
			`⚠️  Не подошло ни одно правило: ${unknown.join(', ')} (см. CATEGORIES)`,
		);
	}

	if (wip.length) {
		console.log(`[*] в работе: ${wip.length} — ${wip.join(', ')}`);
	}

	if (!write) {
		console.log(
			'[js-snippets] обновить README: npm run js-snippets -- --write',
		);
	}
}

main();
