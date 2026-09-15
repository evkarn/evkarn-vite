function goBackTop(offsetViewButton) {
	'use strict';

	// Получаем кнопку в переменную
	const btn = document?.querySelector('[data-go-back-top]');

	function handleClick() {
		window.scrollTo({
			top: 0,
			left: 0,
			behavior: 'smooth',
		});
	}

	function addRemoveActiveClass() {
		// Сколько нужно проскролить, чтобы появилась кнопка
		const breakpoint = offsetViewButton;

		// Если прокрутили на значение breakpoint, задаём кнопке указанный класс
		if (window.scrollY >= breakpoint) {
			btn.classList.add('is-active');
		} else {
			btn.classList.remove('is-active');
		}
	}

	if (btn) {
		window.addEventListener('scroll', addRemoveActiveClass);

		btn.addEventListener('click', handleClick);
	}
}

export default goBackTop;
