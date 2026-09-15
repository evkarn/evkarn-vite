import hljs from 'highlight.js/lib/core';

import javascript from 'highlight.js/lib/languages/javascript.js';
import css from 'highlight.js/lib/languages/css.js';
import xml from 'highlight.js/lib/languages/xml.js';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('css', css);
hljs.registerLanguage('xml', xml);

function highlightCode() {
	const preCodeElements = document?.querySelectorAll('.hljs');

	preCodeElements.forEach((el) => {
		hljs.highlightElement(el);
	});
}

export default highlightCode;
