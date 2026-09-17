// Постобработка CSS после компиляции Sass
import autoprefixer from 'autoprefixer';
import postcssPresetEnv from 'postcss-preset-env';
import postcssSortMediaQueries from 'postcss-sort-media-queries';
import pxToRem from 'postcss-pxtorem';
import cssnano from 'cssnano';

export default {
	plugins: [
		autoprefixer({
			overrideBrowserslist: ['last 5 versions'],
			cascade: false,
		}),
		postcssPresetEnv({}),
		postcssSortMediaQueries({
			sort: 'desktop-first',
		}),
		pxToRem({
			propList: ['*'],
			selectorBlackList: [],
			replace: true,
			mediaQuery: true,
		}),
		cssnano({
			preset: ['default'],
		}),
	],
};
