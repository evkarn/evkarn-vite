import { minify } from 'html-minifier-terser';

export function htmlMinifyPlugin() {
	return {
		name: 'vite-plugin-html-minify',
		async transformIndexHtml(html) {
			return minify(html, {
				collapseWhitespace: true,
				removeComments: true,
				removeRedundantAttributes: true,
				useShortDoctype: true,
				minifyCSS: true,
			});
		},
	};
}
