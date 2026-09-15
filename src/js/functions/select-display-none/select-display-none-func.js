export function selectDisplayNone() {
	'use strict';

	// Собираем все элементы с атрибутом "data-selects"
	const selects = document?.querySelectorAll('[data-selects]');

	// Проверяем есть ли они
	if (selects.length > 0) {
		// Получение селектов
		const selectsElement = Array.from(selects).filter(
			function (item, index, self) {
				return !item.dataset.selects.split(',')[0];
			},
		);

		document.addEventListener('click', function (e) {
			const target = e.target;

			// Подмена текста в заголовке select при клике на select-option
			if (target.closest('[data-option-inner-button]')) {
				const targetText = target.innerText;

				const targetBody = target.closest('[data-select-body]');

				const targetSelectTitle = targetBody.querySelector(
					'[data-select-title]',
				);

				targetSelectTitle.classList.add('is-active-title');

				const targetSelectText = targetBody.querySelector('[data-select-text]');

				if (targetSelectText) {
					targetSelectText.innerText = targetText;
				}
			}
			// Конец. Подмена текста в заголовке select при клике на select-option

			// Закрытие select при клике вне его
			if (!target.closest('[data-selects]')) {
				const selectActiveTitles = document?.querySelectorAll(
					'[data-select-title].active',
				);

				const selectActiveOptions = document?.querySelectorAll(
					'[data-select-options].active',
				);

				selectActiveTitles.forEach((title) => {
					title.classList.remove('active');
				});

				selectActiveOptions.forEach((options) => {
					options.classList.remove('active');
				});
			}
			// Конец. Закрытие select при клике вне его

			// Закрытие select при клике на data-select-option
			if (target.closest('[data-select-option]')) {
				const targetDataSelectWrapper = target.closest('[data-select-body]');

				const targetSelectActiveTitle = targetDataSelectWrapper.querySelector(
					'[data-select-title].active',
				);

				const targetSelectActiveOptions = targetDataSelectWrapper.querySelector(
					'[data-select-options].active',
				);

				if (targetSelectActiveTitle) {
					targetSelectActiveTitle.classList.remove('active');
				}

				if (targetSelectActiveOptions) {
					targetSelectActiveOptions.classList.remove('active');
				}
			}
			// Конец. Закрытие select при клике на data-select-option
		});
	}

	// Раскрытие и закрытие селекта
	function selectWork() {
		if (selects.length > 0) {
			const selectsElement = Array.from(selects).filter(
				function (item, index, self) {
					return !item.dataset.selects.split(',')[0];
				},
			);

			selectsElement.forEach((selectsBlock) => {
				selectsBlock.addEventListener('click', (e) => {
					if (e.target.closest('[data-select-title]')) {
						e.target.classList.toggle('active');

						const buttonHeight = e.target.closest(
							'[data-select-title]',
						).offsetHeight;

						const rootElement = document.querySelector(':root');

						rootElement.style.setProperty(
							'--select-button-height',
							`${buttonHeight}px`,
						);

						e.target
							.closest('[data-select-title]')
							.nextElementSibling.classList.toggle('active');
					}
				});
			});
		}
	}
	selectWork();
	// Конец. Раскрытие и закрытие селекта
}
