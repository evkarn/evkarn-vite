export function navActiveLink() {
	'use strict';

	const dataActiveLink = document?.querySelector('[data-active-link]');

	const sections = document?.querySelectorAll('.section');

	const navLinksGoto = document?.querySelectorAll('[data-goto]');

	const header = document?.querySelector('header');

	const headerHeight = header.offsetHeight;

	if (dataActiveLink) {
		window.addEventListener('scroll', () => {
			// Помещаем в переменную расстояние на которое прокрутили экран
			let scrollDistance = window.pageYOffset;

			// Помещаем в переменную секцию с классом section--current
			let sectionCurrent = document.querySelector('.section--current');

			if (navLinksGoto.length > 0) {
				sections.forEach((el, i) => {
					if (
						el.offsetTop - headerHeight <= scrollDistance &&
						el.offsetTop + el.offsetHeight >= scrollDistance
					) {
						el.classList.add('section--current');
					} else {
						el.classList.remove('section--current');
					}

					if (el.classList.contains('section--current')) {
						let sectionCurrent = el;

						let dataSectionCurrent = sectionCurrent.dataset.section;

						navLinksGoto.forEach((el) => {
							if (el.classList.contains('nav__link--active')) {
								el.classList.remove('nav__link--active');
							}

							if (el.dataset.goto === dataSectionCurrent) {
								el.classList.add('nav__link--active');
							}
						});
					}
				});

				if (!sectionCurrent) {
					navLinksGoto.forEach((el) => {
						if (el.classList.contains('nav__link--active')) {
							el.classList.remove('nav__link--active');
						}
					});
				}
			}
		});
	}
}
