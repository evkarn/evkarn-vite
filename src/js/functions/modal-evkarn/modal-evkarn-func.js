export function modalEvkarn() {
	'use strict';

	const modals = document?.querySelector('[data-modals]');

	if (modals) {
		const buttons = document.querySelectorAll('[data-modal-path]');

		const buttonsClose = document.querySelectorAll('[data-modal-close]');

		const modalsOverlay = document.querySelector('[data-modals-overlay]');

		const modals = document.querySelectorAll('[data-modal-target]');

		const scrollWidth = window.innerWidth - document.body.offsetWidth;

		document
			.querySelector(':root')
			.style.setProperty('--scroll-width', `${scrollWidth}px`);

		const disableScroll = function () {
			let pagePosition = window.scrollY;

			body.classList.add('stop-scroll');

			body.dataset.position = pagePosition;

			document
				.querySelector(':root')
				.style.setProperty('--top-position', `-${pagePosition}px`);

			document.documentElement.style.scrollBehavior = 'unset';
		};

		const enableScroll = function () {
			let pagePosition = parseInt(document.body.dataset.position, 10);

			body.classList.remove('stop-scroll');

			window.scroll({ top: pagePosition, left: 0 });

			body.removeAttribute('data-position');

			document
				.querySelector(':root')
				.style.setProperty('--top-position', 'auto');

			document.documentElement.style.scrollBehavior = '';
		};

		buttons.forEach((el) => {
			el.addEventListener('click', (e) => {
				let dataModalPath = e.currentTarget.getAttribute('data-modal-path');

				modals.forEach((el) => {
					el.classList.remove('modal--visible');
				});

				const modalTarget = document.querySelector(
					`[data-modal-target="${dataModalPath}"]`,
				);

				modalTarget.classList.add('modal--visible');

				modalsOverlay.classList.add('modals__overlay--visible');

				disableScroll();
			});
		});

		modalsOverlay.addEventListener('click', (e) => {
			if (e.target == modalsOverlay) {
				modalsOverlay.classList.remove('modals__overlay--visible');

				modals.forEach((el) => {
					el.classList.remove('modal--visible');
				});

				enableScroll();
			}
		});

		buttonsClose.forEach((el) => {
			el.addEventListener('click', (e) => {
				modalsOverlay.classList.remove('modals__overlay--visible');

				modals.forEach((el) => {
					el.classList.remove('modal--visible');
				});

				enableScroll();
			});
		});
	}
}
