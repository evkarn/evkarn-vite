import Typograf from 'typograf';

// Контент в этих тегах типографировать нельзя (код, листинги, скрипты, служебные блоки).
const SAFE_TAGS = [
	/<head(\s[^>]*)?>[\s\S]*?<\/head>/gi,
	/<pre(\s[^>]*)?>[\s\S]*?<\/pre>/gi,
	/<code(\s[^>]*)?>[\s\S]*?<\/code>/gi,
	/<script(\s[^>]*)?>[\s\S]*?<\/script>/gi,
	/<style(\s[^>]*)?>[\s\S]*?<\/style>/gi,
	/<textarea(\s[^>]*)?>[\s\S]*?<\/textarea>/gi,
];

/**
 * Vite-плагин типографирования HTML (аналог gulp-typograf).
 * Прогоняет итоговый HTML через Типограф (typograf.ru): расставляет
 * неразрывные пробелы, «ёлочки», тире, кавычки и прочие мелочи набора.
 *
 * Выполняется последним (после htmlMinifyPlugin), чтобы неразрывные пробелы
 * и сущности не схлопывались минификатором.
 *
 * @param {Object} [options]
 * @param {string[]} [options.locale=['ru','en-US']] - языки типографирования
 * @param {Object} [options.htmlEntity] - настройка HTML-сущностей
 *   https://github.com/typograf/typograf/blob/master/docs/api_entities.md
 * @param {string[]} [options.disable] - правила, которые нужно отключить
 * @param {string[]} [options.enable] - правила, которые нужно включить
 * @returns {import('vite').Plugin}
 */
export function typografPlugin(options = {}) {
	const {
		locale = ['ru', 'en-US'],
		htmlEntity,
		disable,
		enable,
		...rest
	} = options;

	const tp = new Typograf({
		locale,
		htmlEntity: { type: 'name', onlyInvisible: true, ...htmlEntity },
		...rest,
	});

	for (const tag of SAFE_TAGS) {
		tp.addSafeTag(tag);
	}

	if (disable) {
		for (const rule of disable) {
			tp.disable(rule);
		}
	}

	if (enable) {
		for (const rule of enable) {
			tp.enable(rule);
		}
	}

	return {
		name: 'vite:typograf',
		transformIndexHtml(html) {
			return tp.execute(html);
		},
	};
}
