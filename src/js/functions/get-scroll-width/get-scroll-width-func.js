import vars from '@components/vars.js';

function getScrollbarWidth() {
	'use strict';

	const scrollbarWidth = window.innerWidth - vars.bodyEl.offsetWidth;

	vars.htmlEl.style.setProperty('--scroll-width', `${scrollbarWidth}px`);

	return scrollbarWidth;
}

export default getScrollbarWidth;
