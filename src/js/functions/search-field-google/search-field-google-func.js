export function searchFieldGoogle() {
	'use strict';

	const searchButton = document?.querySelector('[data-search-button]');

	const searchField = document?.querySelector('[data-search-field-google]');

	const headerHeight = document.querySelector('header').offsetHeight;

	document.documentElement.style.setProperty(
		'--header-height',
		`${headerHeight}px`,
	);

	if (searchButton && searchField) {
		searchButton.addEventListener('click', function () {
			searchField.classList.toggle('search-field-google--active');
		});
	}

	document.addEventListener('keydown', function (e) {
		if (
			e.keyCode == 27 &&
			searchField.classList.contains('search-field-google--active')
		) {
			searchField.classList.remove('search-field-google--active');
		}
	});

	// при клике в любом месте окна браузера
	window.addEventListener('click', (e) => {
		// находим элемент, на котором был клик
		const target = e.target;

		// если этот элемент или его родительские элементы не поле поиска и не кнопка вызова поля поиска
		if (
			!target.closest('.search-field-google') &&
			!target.closest('.search-button')
		) {
			// то закрываем поле поиска, удаляя активный класс
			searchField.classList.remove('search-field-google--active');
		}
	});
};
