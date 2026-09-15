import vars from '@components/vars.js';

function enableScroll() {
	'use strict';
	let pagePosition = parseInt(vars.bodyEl.dataset.position, 10);

	vars.bodyEl.classList.remove('stop-scroll');

	window.scroll({
		top: pagePosition,

		left: 0,
	});

	vars.bodyEl.removeAttribute('data-position');

	vars.htmlEl.style.setProperty('--top-position', 'auto');

	vars.htmlEl.style.scrollBehavior = '';
}
