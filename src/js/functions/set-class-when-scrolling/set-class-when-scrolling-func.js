function setClassWhenScrolling(e) {
	'use strict';

	let currentY = window.scrollY;

	let previousY = currentY;

	const header = document.querySelector('.site-header');

	const navSec = document.querySelector('.nav-sec');

	const scrollHandler() {
		previousY = currentY;

		currentY = window.scrollY;

		if (currentY > 50 && currentY >= previousY) {
			header.classList.add('is-hidden');

			navSec.classList.remove('offset-header');
		} else {
			header.classList.remove('is-hidden');

			navSec.classList.add('offset-header');
		}
	};

	window.addEventListener('scroll', scrollHandler);
	scrollHandler();
}

export default setClassWhenScrolling;