// (function tabs() {
// 	'use strict';

// 	const tabsParents = document?.querySelectorAll('[data-tabs-parent]');

// 	if (!tabsParents) return;

// 	tabsParents.forEach(el => {
// 		el.addEventListener('click', e => {
// 			const parent = e.target.closest('[data-tabs-parent]');

// 			const tabsButtons = parent?.querySelectorAll('[data-tabs-button]');

// 			if (e.target.closest('[data-tabs-button]')) {
// 				const tabsPath = e.target.closest('[data-tabs-button]').dataset.tabsBtn;

// 				tabsButtons.forEach(el => {
// 					el.classList.remove('tabs__button--active');
// 					el.setAttribute('aria-selected', 'false');
// 				});

// 				const targetButton = parent.querySelector(
// 					`[data-tabs-button="${tabsPath}"]`,
// 				);

// 				targetButton.classList.add('tabs__button--active');
// 				targetButton.setAttribute('aria-selected', 'true');

// 				tabsHandler(tabsPath, parent);
// 			}

// 			if (e.target.closest('[data-tabs-prev]')) {
// 				const parent = e.target.closest('[data-tabs-parent]');

// 				const activeBtn = parent.querySelector('.tabs__button--active');

// 				const prevBtn = activeBtn?.previousElementSibling;

// 				const currentPath = activeBtn.dataset.tabsBtn;

// 				const activeContent = parent.querySelector(
// 					`[data-tabpanel="${currentPath}"]`,
// 				);

// 				let prevContent = activeContent.previousElementSibling;

// 				if (prevContent) {
// 					tabsButtons.forEach(el => {
// 						el.classList.remove('tabs__button--active');
// 						el.setAttribute('aria-selected', 'false');
// 					});

// 					prevBtn.classList.add('tabs__button--active');
// 					prevBtn.setAttribute('aria-selected', 'true');

// 					let path = prevContent.dataset.tabpanel;

// 					tabsHandler(path, parent);
// 				}
// 			}

// 			if (e.target.closest('[data-tabs-next]')) {
// 				const parent = e.target.closest('[data-tabs-parent]');

// 				const activeBtn = parent.querySelector('.tabs__button--active');

// 				const nextBtn = activeBtn?.nextElementSibling;

// 				const currentPath = activeBtn.dataset.tabsBtn;

// 				const activeContent = parent.querySelector(
// 					`[data-tabpanel="${currentPath}"]`,
// 				);

// 				let nextContent = activeContent.nextElementSibling;

// 				if (nextContent) {
// 					tabsButtons.forEach(el => {
// 						el.classList.remove('tabs__button--active');
// 						el.setAttribute('aria-selected', 'false');
// 					});

// 					nextBtn.classList.add('tabs__button--active');
// 					nextBtn.setAttribute('aria-selected', 'true');

// 					let path = nextContent.dataset.tabpanel;

// 					tabsHandler(path, parent);
// 				}
// 			}
// 		});
// 	});

// 	const tabsHandler = (path, parent) => {
// 		const tabPanels = parent?.querySelectorAll('[data-tabpanel]');

// 		tabPanels.forEach(el => {
// 			el.classList.remove('tabs__panel--active');
// 		});

// 		const target = parent?.querySelector(`[data-tabpanel="${path}"]`);

// 		if (target) {
// 			target.classList.add('tabs__panel--active');
// 		}
// 	};
// })();

(function tabsInit() {
	'use strict';

	const tabsParents = document.querySelectorAll('[data-tabs-parent]');

	if (!tabsParents) return;

	tabsParents.forEach(parent => {
		const buttons = parent.querySelectorAll('[data-tabs-button]');
		const panels = parent.querySelectorAll('[data-tabpanel]');

		// Инициализация первого элемента
		const firstButton = buttons[0];
		firstButton.classList.add('tabs__btn--active');
		firstButton.setAttribute('aria-selected', 'true');
		firstButton.focus();

		// Обработка кликов
		parent.addEventListener('click', handleClick);

		// Обработка клавиатуры
		parent.addEventListener('keydown', handleKeydown);

		function handleClick(e) {
			const target = e.target.closest(
				'[data-tabs-button], [data-tabs-prev], [data-tabs-next]',
			);

			if (!target) return;

			if (target.closest('[data-tabs-button]')) {
				const btn = target.closest('[data-tabs-button]');
				const path = btn.dataset.tabsButton;

				updateTabs(path, btn);
				btn.focus();
			} else if (target.closest('[data-tabs-prev]')) {
				const activeBtn = parent.querySelector('.tabs__btn--active');
				const prevBtn =
					activeBtn.previousElementSibling || buttons[buttons.length - 1];

				updateTabs(prevBtn.dataset.tabsButton, prevBtn);
				prevBtn.focus();
			} else if (target.closest('[data-tabs-next]')) {
				const activeBtn = parent.querySelector('.tabs__btn--active');
				const nextBtn = activeBtn.nextElementSibling || buttons[0];

				updateTabs(nextBtn.dataset.tabsButton, nextBtn);
				nextBtn.focus();
			}
		}

		function handleKeydown(e) {
			const activeButton = parent.querySelector('.tabs__btn--active');
			let targetButton;

			switch (e.key) {
				case 'ArrowRight':
					targetButton = activeButton.nextElementSibling || buttons[0];
					break;
				case 'ArrowLeft':
					targetButton =
						activeButton.previousElementSibling || buttons[buttons.length - 1];
					break;
				case 'Enter':
					handleClick({ target: activeButton });
					return;
				default:
					return;
			}

			e.preventDefault();
			updateTabs(targetButton.dataset.tabsButton, targetButton);
			targetButton.focus();
		}

		function updateTabs(path, button) {
			// Обновление кнопок
			buttons.forEach(btn => {
				btn.classList.remove('tabs__btn--active');
				btn.setAttribute('aria-selected', 'false');
			});

			button.classList.add('tabs__btn--active');
			button.setAttribute('aria-selected', 'true');

			// Обновление панелей
			panels.forEach(panel => {
				panel.classList.remove('tabs__panel--active');
				panel.setAttribute('aria-hidden', 'true');
			});

			const activePanel = parent.querySelector(`[data-tabpanel="${path}"]`);
			if (activePanel) {
				activePanel.classList.add('tabs__panel--active');
				activePanel.setAttribute('aria-hidden', 'false');
			}
		}
	});
})();

export default tabs;
