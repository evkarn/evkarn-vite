export function navActiveLink() {
	'use strict';

	const dataActiveLink = document?.querySelector('[data-active-link]');

	const sections = document.querySelectorAll('.section');

	if (dataActiveLink) {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						const links = document.querySelectorAll('.nav__link');

						links.forEach((link) => {
							let marker = link?.getAttribute('href').replace('#', '');

							if (
								entry.target.id === marker ||
								entry.target.classList.contains(marker)
							) {
								link.classList.add('nav__link--active');
							} else {
								link.classList.remove('nav__link--active');
							}
						});
					}
				});
			},
			{
				threshold: 0.75,
			},
		);

		sections.forEach((el) => {
			observer.observe(el);
		});
	}
}
