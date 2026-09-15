export function windowOnKey27Down() {
	const burger = document?.querySelector('[data-burger]');
	const nav = document?.querySelector('[data-nav]');
	const headerOverlay = document?.querySelector('[data-header-overlay]');
	const cartContent = document?.querySelector('[data-cart-content]');
	const cartOverlay = document?.querySelector('.cart__overlay');

	const handleEscapeKey = event => {
		if (event.key === 'Escape') {
			// Убираем активные классы
			burger?.classList.remove('burger--active');
			nav?.classList.remove('bottom-nav--visible');
			headerOverlay?.classList.remove('header__overlay--visible');
			cartContent?.classList.remove('cart-content--active');
			cartOverlay?.classList.remove('cart__overlay--visible');

			// Вызываем функцию включения скролла
			enableScroll?.();
		}
	};

	// Добавляем обработчик событий
	document.addEventListener('keydown', handleEscapeKey);

	// Возвращаем функцию для удаления обработчика (опционально)
	return () => {
		document.removeEventListener('keydown', handleEscapeKey);
	};
}
