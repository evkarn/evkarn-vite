export function search() {
	'use strict';

	const searchButton = document?.querySelector('[data-search-button]');

	const searchBlock = document?.querySelector('[data-search-block]');

	searchButton?.addEventListener('click', function() {
		searchBlock?.classList.toggle('search-block--visible');

		searchButton?.classList.toggle('search-button--is-active');

		if (searchButton?.classList.contains('search-button--is-active')) {
			searchButton?.setAttribute('aria-expanded', 'true');

			searchButton?.setAttribute('aria-label', 'Закрыть поиск');
		} else {
			searchButton?.setAttribute('aria-expanded', 'false');

			searchButton?.setAttribute('aria-label', 'Открыть поиск');
		}
	});

	document.addEventListener('keydown', function(e) {
		if (
			e.code == 'Escape' &&
			searchBlock.classList.contains('search-block--visible')
		) {
			searchBlock.classList.remove('search-block--visible');

			searchButton?.setAttribute('aria-expanded', 'false');

			searchButton?.setAttribute('aria-label', 'Открыть поиск');
		}
	});

	window.addEventListener('click', (e) => {
		if (!e.target.closest('.search-block') && !e.target.closest('.header')) {
			searchBlock.classList.remove('search-block--visible');

			searchButton?.setAttribute('aria-expanded', 'false');

			searchButton?.setAttribute('aria-label', 'Открыть поиск');
		}
	});
};
