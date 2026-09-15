(function () {
	// Универсальная страховка на все случаи жизни
	if (document.readyState === 'loading') {
		// DOM еще строится (актуально для скриптов в <head> без defer)
		document.addEventListener('DOMContentLoaded', init);
	} else {
		// DOM уже готов (актуально для defer, async или скриптов в конце body)
		init();
	}

	function init() {
		const htmlEl = document.documentElement;
		const bodyEl = document.body;
		const burger = document?.querySelector('[data-burger]');
		const nav = document?.querySelector('[data-nav]');
		const navItems = document?.querySelectorAll('[data-nav-item]');
		const overlay = document?.querySelector('[data-nav-overlay]');
		const fixedEls = document?.querySelectorAll('[data-fixed');

		(function getScrollbarWidth() {
			'use strict';

			const scrollbarWidth = window.innerWidth - bodyEl.offsetWidth;

			htmlEl.style.setProperty('--scroll-width', `${scrollbarWidth}px`);

			return scrollbarWidth;
		})();

		function disableScroll() {
			'use strict';

			let pagePosition = window.scrollY;

			bodyEl.classList.add('stop-scroll');

			bodyEl.dataset.position = pagePosition;

			htmlEl.style.setProperty('--top-position', `-${pagePosition}px`);

			htmlEl.style.scrollBehavior = 'unset';
		}

		function enableScroll() {
			'use strict';

			let pagePosition = parseInt(bodyEl.dataset.position, 10);

			bodyEl.classList.remove('stop-scroll');

			window.scroll({
				top: pagePosition,

				left: 0,
			});

			bodyEl.removeAttribute('data-position');

			htmlEl.style.setProperty('--top-position', 'auto');

			htmlEl.style.scrollBehavior = '';
		}

		(function burgerInit() {
			'use strict';

			if (burger && nav) {
				burger.addEventListener('click', () => {
					burger.classList.toggle('burger--is-active');

					nav.classList.toggle('nav--is-visible');

					fixedEls.forEach(function (el) {
						el.classList.toggle('not-leap');
					});

					if (burger.getAttribute('aria-expanded') === 'false') {
						burger.setAttribute('aria-expanded', 'true');

						burger.setAttribute('aria-pressed', 'true');

						burger.setAttribute('aria-label', 'Закрыть меню');

						disableScroll();
					} else {
						burger.setAttribute('aria-expanded', 'false');

						burger.setAttribute('aria-pressed', 'false');

						burger.setAttribute('aria-label', 'Открыть меню');

						enableScroll();
					}
				});
			}

			if (navItems) {
				navItems.forEach(el => {
					el.addEventListener('click', () => {
						enableScroll();

						if (burger) {
							burger.setAttribute('aria-expanded', 'false');

							burger.setAttribute('aria-pressed', 'false');

							burger.setAttribute('aria-label', 'Открыть меню');

							burger.classList.remove('burger--is-active');
						}

						if (nav) {
							nav.classList.remove('nav--is-active');
						}
					});
				});
			}

			if (overlay) {
				overlay.addEventListener('click', () => {
					if (burger) {
						burger.setAttribute('aria-expanded', 'false');

						burger.setAttribute('aria-pressed', 'false');

						burger.setAttribute('aria-label', 'Открыть меню');

						burger.classList.remove('burger--is-active');
					}

					if (nav) {
						nav.classList.remove('nav--is-active');
					}

					enableScroll();
				});
			}
		})();

		(function getFullYear(selector) {
			'use strict';

			const currentYear = new Date().getFullYear();

			const yearEl = document?.querySelector(selector);

			const metaYear = document?.querySelector('[itemprop="copyrightYear"]');

			if (yearEl) {
				yearEl.innerHTML = currentYear;
			}

			if (metaYear) {
				metaYear.setAttribute('content', currentYear);
			}
		})();

		function getElementHeight(selector, varHeightName, threshold = 0.05) {
			let lastWidth = window.innerWidth;
			let lastHeight = window.innerHeight;
			let timeoutId;

			function heightDetermination() {
				const element = document?.querySelector(`${selector}`);

				if (element) {
					const elementHeight = element.offsetHeight;
					document.documentElement.style.setProperty(
						`${varHeightName}`,
						`${elementHeight}px`,
					);
				}
			}

			function checkSignificantChange() {
				const newWidth = window.innerWidth;
				const newHeight = window.innerHeight;

				// Изменение ширины больше порога или смена ориентации
				const widthChanged =
					Math.abs(newWidth - lastWidth) / lastWidth > threshold;
				const orientationChanged =
					lastWidth > lastHeight !== newWidth > newHeight;

				if (widthChanged || orientationChanged) {
					lastWidth = newWidth;
					lastHeight = newHeight;

					// Небольшая задержка для стабилизации
					clearTimeout(timeoutId);
					timeoutId = setTimeout(heightDetermination, 100);
				}
			}

			// Инициализация
			heightDetermination();

			// Отслеживаем ресайз с умом
			window.addEventListener('resize', checkSignificantChange);

			// Возвращаем функцию для очистки
			return () => {
				clearTimeout(timeoutId);
				window.removeEventListener('resize', checkSignificantChange);
			};
		}
		getElementHeight('.header', '--header-height');
	}
})();
