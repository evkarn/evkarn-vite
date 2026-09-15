const scrollToElement = (() => {
	'use strict';

	const headerHeight = document?.querySelector('.header').offsetHeight;

	const triggers = document?.querySelectorAll('[data-go-to]');

	function initScroll(e) {
		e.preventDefault();

		// Помещаем в переменную ссылку по которой кликнули
		const targetName = e.target.dataset.goTo;

		// Помещаем элемент с классом или id как в атрибуте data-goto в переменную
		const targetEl = document?.querySelector(`${targetName}`);

		// Если у ссылки есть атрибут data-goto и в DOM есть элемент с таким классом или id
		if (targetName && targetEl) {
			// Рассчитываем положение элемента до которого нужно скролить на странице минус высоту header
			const scrollHeight =
				targetEl.getBoundingClientRect().top + scrollY - headerHeight;

			// Прокручиваем страницу до этого элемента
			window.scrollTo({
				top: scrollHeight,
				behavior: 'smooth',
			});
		}
	}

	if (triggers) {
		triggers.forEach((el) => {
			el.addEventListener('click', initScroll);
		});
	}
})();

export default scrollToElement;
