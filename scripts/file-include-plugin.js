import fs from 'node:fs';
import path from 'node:path';

const MAX_RECURSION = 100;

const DIRECTIVE_RE = new RegExp(
	`@include\\s*\\(\\s*(['"])([^'"]+)\\1\\s*(?:,\\s*(\\{[^{}]*\\}))?\\s*\\)` +
		`|` +
		`@loop\\s*\\(\\s*(['"])([^'"]+)\\4\\s*,\\s*(['"])([^'"]+)\\6\\s*\\)`,
	'g',
);

const PARAM_RE = /@([A-Za-z_][A-Za-z0-9_]*)/g;

const PRE_CODE_RE = /<(pre|code)(\s[^>]*)?>[\s\S]*?<\/\1>/gi;

// Блоки <pre>/<code> временно прячем, чтобы @include/@param внутри них не обрабатывались.
function escapeCodeAndPre(html) {
	const placeholders = [];
	const text = html.replace(PRE_CODE_RE, match => {
		placeholders.push(match);
		return `@@EVKARN_BLOCK_${placeholders.length - 1}@@`;
	});
	return { text, placeholders };
}

function unescapeCodeAndPre(html, placeholders) {
	return placeholders.reduce(
		(acc, block, i) => acc.replace(`@@EVKARN_BLOCK_${i}@@`, block),
		html,
	);
}

function substituteParams(content, context) {
	if (!context || Object.keys(context).length === 0) return content;
	return content.replace(PARAM_RE, (token, key) => {
		return Object.prototype.hasOwnProperty.call(context, key)
			? token.replace(`@${key}`, context[key])
			: token;
	});
}

function parseParams(raw) {
	if (!raw) return {};

	const cleaned = raw.replace(/,(\s*[}\]])/g, '$1');
	return JSON.parse(cleaned);
}

function resolveOrThrow(sourcePath, root, target) {
	const candidates = [];
	const clean = target.replace(/^@root\/?/, '');
	if (!target.startsWith('@root') && path.isAbsolute(clean)) {
		candidates.push(clean);
	} else {
		if (!target.startsWith('@root')) {
			candidates.push(
				path.resolve(path.dirname(sourcePath), clean),
				path.resolve(root, clean),
			);
		} else {
			candidates.push(path.resolve(root, clean));
		}
	}

	for (const candidate of candidates) {
		if (fs.existsSync(candidate)) return candidate;
	}

	// Прячем исходный include для понятного сообщения об ошибке
	throw new Error(
		`[vite:file-include] файл не найден: "${target}" ` +
			`(проверено: ${candidates.join(', ')})`,
	);
}

function readFile(filePath) {
	return fs.readFileSync(filePath, 'utf8');
}

function processLoop(
	sourcePath,
	root,
	loopTemplate,
	loopData,
	context,
	depth,
	wrapper,
) {
	const dataPath = resolveOrThrow(sourcePath, root, loopData);
	const templatePath = resolveOrThrow(sourcePath, root, loopTemplate);
	wrapper.includedFiles.add(dataPath).add(templatePath);

	const items = JSON.parse(readFile(dataPath));

	if (!Array.isArray(items)) {
		throw new Error(
			`[vite:file-include] данные для @loop должны быть массивом: "${loopData}"`,
		);
	}

	const template = readFile(templatePath);

	return items
		.map((item, i) => {
			const itemData =
				item && typeof item === 'object'
					? { ...item, index: i + 1 }
					: { value: item, index: i + 1 };
			return processContent(
				template,
				templatePath,
				root,
				{ ...context, ...itemData },
				depth + 1,
				wrapper,
			);
		})
		.join('');
}

function processContent(source, sourcePath, root, context, depth, wrapper) {
	if (depth > MAX_RECURSION) {
		throw new Error(
			`[vite:file-include] превышен лимит вложенности (${MAX_RECURSION}): ${sourcePath}`,
		);
	}

	const { text, placeholders } = escapeCodeAndPre(source);

	// Подставляем @params текущего файла до обработки вложенных include
	const substituted = substituteParams(text, context);

	const result = substituted.replace(DIRECTIVE_RE, (...args) => {
		const full = args[0];
		const includeQuote = args[1];
		const includePath = args[2];
		const includeParams = args[3];
		const loopQuote = args[4];
		const loopTemplate = args[5];
		const loopData = args[7];

		if (includeQuote !== undefined) {
			const filePath = resolveOrThrow(sourcePath, root, includePath);
			wrapper.includedFiles.add(filePath);
			const childContext = {
				...context,
				...parseParams(includeParams),
			};
			return processContent(
				readFile(filePath),
				filePath,
				root,
				childContext,
				depth + 1,
				wrapper,
			);
		}

		if (loopQuote !== undefined) {
			return processLoop(
				sourcePath,
				root,
				loopTemplate,
				loopData,
				context,
				depth,
				wrapper,
			);
		}

		return full;
	});

	return unescapeCodeAndPre(result, placeholders);
}

/**
 * Плагин обработки директив @@include / @@loop (аналог gulp-file-include).
 * Пути в директивах резолвятся относительно корня Vite (как basepath @root).
 * @param {Object} [options]
 * @param {string} [options.root] - абсолютный путь корня проекта
 * @returns {import('vite').Plugin}
 */
export function fileIncludePlugin(options = {}) {
	const root = path.resolve(options.root || process.cwd());
	let includedFiles = new Set();

	return {
		name: 'vite:file-include',

		transformIndexHtml: {
			order: 'pre',
			handler(html, { filename }) {
				const wrapper = { includedFiles: new Set() };
				const sourcePath = path.resolve(filename);
				const result = processContent(html, sourcePath, root, {}, 0, wrapper);
				includedFiles = wrapper.includedFiles;
				return result;
			},
		},

		handleHotUpdate({ file, server }) {
			const normalized = path.normalize(file);
			if (includedFiles.has(normalized)) {
				server.ws.send({ type: 'full-reload', path: '*' });
				return [];
			}
		},
	};
}
