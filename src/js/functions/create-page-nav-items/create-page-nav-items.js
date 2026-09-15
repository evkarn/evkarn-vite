(function createPageNavItems() {
	'use strict';

	const titles = document?.querySelectorAll('[data-article-main] h2');

	const navPageList = document?.querySelector('[data-nav-page-list]');

	if (!titles || !navPageList) {
		return function () {
			console.log('Нет заголовков или списка меню');
		};
	}

	titles.forEach(function (el, index) {
		const titleText = el.textContent;

		if (!el.id) {
			el.id = `h2-${index}`;
		}

		const titleId = el.getAttribute('id');

		navPageList.insertAdjacentHTML(
			'beforeend',
			`<li class="nav-page__item flex"><a class="nav-page__link" href="#${titleId}" data-nav-page-link="${titleId}">${titleText}</a></li>`,
		);
	});
})();

export default createPageNavItems;
