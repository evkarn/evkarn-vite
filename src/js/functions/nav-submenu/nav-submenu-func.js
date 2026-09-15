export function navSubmenu() {
	const buttonsArrow = document?.querySelectorAll('[data-btn-submenu]');

	buttonsArrow?.forEach((el) => {
		el.addEventListener('click', () => {
			el.classList.toggle('is-active');

			const parentItem = el.closest('.nav__item--with-sublist');

			const currentSublist = parentItem?.querySelector('.nav__sublist');

			currentSublist.classList.toggle('is-active');

			if (el.classList.contains('is-active')) {
				el.setAttribute('aria-expanded', 'true');

				el.setAttribute('aria-label', 'Закрыть подменю');
			} else {
				el.setAttribute('aria-expanded', 'false');

				el.setAttribute('aria-label', 'Открыть подменю');
			}
		});
	});
}
