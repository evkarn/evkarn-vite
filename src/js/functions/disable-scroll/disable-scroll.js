import vars from '@components/vars.js';

function disableScroll() {
	'use strict';

	let pagePosition = window.scrollY;

	vars.bodyEl.classList.add('stop-scroll');

	vars.bodyEl.dataset.position = pagePosition;

	vars.htmlEl.style.setProperty('--top-position', `-${pagePosition}px`);

	vars.htmlEl.style.scrollBehavior = 'unset';
}

export default disableScroll;
