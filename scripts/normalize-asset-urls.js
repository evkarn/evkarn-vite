// Vite-плагин: переводит относительные ссылки на ассеты в корневые.
//
// Зачем. Vite резолвит относительный URL в HTML относительно файла, в котором
// он записан. Для index.html в корне это работает, но вложенная страница
// (blog/post.html) ищет assets/... рядом с собой, не находит — и молча
// оставляет строку как есть: сборка проходит, в проде 404.
//
// Нормализуем assets/... → /assets/..., чтобы резолвить от root независимо от
// глубины. Дальше Vite сам перепишет путь относительно готовой страницы
// (./assets/... в корне, ../assets/... во вложенной) и проверит existence.
//
// Правило намеренно узкое: префиксуются только значения, начинающиеся с
// assets/. Всё остальное (скрипты, стили, ссылки на страницы, data:, http:,
// #, абсолютные /assets/...) не трогается.
//
// Порядок: хук с order: 'pre' выполняется до того, как Vite начнёт разбирать
// ассеты, поэтому плагин обязан стоять в plugins после fileIncludePlugin —
// иначе он не увидит развёрнутые @include. Внутри одного order работает
// порядок массива.

const ASSET_PREFIX = 'assets/';

// Атрибуты, значение которых может быть URL'ом ассета
const URL_ATTR_RE =
	/(\s)(src|href|xlink:href|content|poster|srcset)(\s*=\s*)(["'])([^"']*)\4/gi;

// url(...) в инлайн-стилях и в блоках <style>
const CSS_URL_RE = /url\(\s*(["']?)([^"')]*)\1\s*\)/gi;

const STYLE_ATTR_RE = /(\sstyle\s*=\s*)(["'])([^"']*)\2/gi;

const STYLE_BLOCK_RE = /(<style\b[^>]*>)([\s\S]*?)(<\/style>)/gi;

// Тело <script> — это код, а не разметка: строковые литералы не трогаем
const SCRIPT_BLOCK_RE = /(<script\b[^>]*>)([\s\S]*?)(<\/script>)/gi;

const SCRIPT_PLACEHOLDER_RE = /@@evkarn-script-(\d+)@@/g;

function isAssetUrl(value) {
	return value.startsWith(ASSET_PREFIX);
}

// "a.webp, b.webp 2x" → "/a.webp, /b.webp 2x" (дескрипторы не трогаем)
function normalizeSrcset(value) {
	return value
		.split(',')
		.map(part => {
			const trimmed = part.trim();

			if (!trimmed) return part;

			const spaceAt = trimmed.search(/\s/);
			const url = spaceAt === -1 ? trimmed : trimmed.slice(0, spaceAt);
			const descriptor = spaceAt === -1 ? '' : trimmed.slice(spaceAt);

			return isAssetUrl(url) ? `/${url}${descriptor}` : trimmed;
		})
		.join(', ');
}

function normalizeCssUrls(css) {
	return css.replace(CSS_URL_RE, (match, quote, url) => {
		if (!isAssetUrl(url)) return match;
		return `url(${quote}/${url}${quote})`;
	});
}

function normalizeAttrs(html) {
	return html
		.replace(URL_ATTR_RE, (match, space, attr, equals, quote, value) => {
			if (attr.toLowerCase() === 'srcset') {
				if (!value.split(',').some(part => isAssetUrl(part.trim()))) {
					return match;
				}

				return `${space}${attr}${equals}${quote}${normalizeSrcset(value)}${quote}`;
			}

			if (!isAssetUrl(value)) return match;

			return `${space}${attr}${equals}${quote}/${value}${quote}`;
		})
		.replace(
			STYLE_ATTR_RE,
			(match, prefix, quote, value) =>
				`${prefix}${quote}${normalizeCssUrls(value)}${quote}`,
		);
}

function normalizeHtml(html) {
	const scriptBodies = [];

	// Вырезаем тела скриптов: атрибуты открывающего тега нормализуем,
	// содержимое возвращаем как есть.
	const withoutScripts = html.replace(
		SCRIPT_BLOCK_RE,
		(match, openTag, body, closeTag) => {
			scriptBodies.push(body);
			return `${normalizeAttrs(openTag)}@@evkarn-script-${scriptBodies.length - 1}@@${closeTag}`;
		},
	);

	const normalized = normalizeAttrs(withoutScripts).replace(
		STYLE_BLOCK_RE,
		(match, openTag, css, closeTag) =>
			`${openTag}${normalizeCssUrls(css)}${closeTag}`,
	);

	return normalized.replace(
		SCRIPT_PLACEHOLDER_RE,
		(match, index) => scriptBodies[Number(index)],
	);
}

/**
 * @returns {import('vite').Plugin}
 */
export function normalizeAssetUrlsPlugin() {
	return {
		name: 'evkarn-normalize-asset-urls',
		transformIndexHtml: {
			order: 'pre',
			handler(html) {
				return normalizeHtml(html);
			},
		},
	};
}
