// INIT ADAPTIVE-SPOILERS
/*
		Для родителя спойлеров пишем атрибут data-spoilers-list

		Для заголовков спойлеров пишем атрибут data-spoiler

		Если нужно включить/выключить работу спойлеров на разных размерах экранов пишем параметры ширины и типа брейкпоинта.

		Например:
			data-spoilers-list="992,max" — спойлеры будут работать только на экранах меньше или равно 992px

			data-spoilers-list="768,min" — спойлеры будут работать только на экранах больше или равно 768px

			Если нужно чтобы в блоке открывался только один спойлер добавляем родителю атрибут data-one-spoiler

			500 в скобках — время открытия и закрытия спойлера в мс
		*/

// adaptiveSpoilers(500);

// END. INIT ADAPTIVE-SPOILERS

import slideUp from '../slide-up/slide-up-func.js';

import slideToggle from '../slide-toggle/slide-toggle-func.js';

function spoilers() {
	'use strict';

	// Собираем все элементы с атрибутом data-spoilers-list
	const spoilersArray = document?.querySelectorAll('[data-spoilers-list]');

	const durationSpeed = '800';

	// Проверяем есть ли они
	if (spoilersArray.length > 0) {
		// Получение обычных спойлеров
		const spoilersRegular = Array.from(spoilersArray).filter(
			function (item, index, self) {
				return !item.dataset.spoilersList.split(',')[0];
			},
		);

		// Инициализация обычных спойлеров
		if (spoilersRegular.length > 0) {
			initSpoilers(spoilersRegular);
		}

		// Получение спойлеров с медиазапросами
		const spoilersMedia = Array.from(spoilersArray).filter(
			function (item, index, self) {
				return item.dataset.spoilersList.split(',')[0];
			},
		);

		// Инициализация спойлеров с медиазапросами
		if (spoilersMedia.length > 0) {
			const breakpointsArray = [];

			spoilersMedia.forEach(item => {
				const params = item.dataset.spoilersList;

				const breakpoint = [];

				const paramsArray = params.split(',');

				breakpoint.value = paramsArray[0];

				breakpoint.type = paramsArray[1] ? paramsArray[1].trim() : 'max';

				breakpoint.item = item;

				breakpointsArray.push(breakpoint);
			});

			// Получаем уникальные брейкпоинты
			let mediaQueries = breakpointsArray.map(function (item) {
				return (
					'(' +
					item.type +
					'-width: ' +
					item.value +
					'px),' +
					item.value +
					',' +
					item.type
				);
			});

			mediaQueries = mediaQueries.filter(function (item, index, self) {
				return self.indexOf(item) === index;
			});

			// Работаем с каждым брейкпоинтом
			mediaQueries.forEach(breakpoint => {
				const paramsArray = breakpoint.split(',');

				const mediaBreakpoint = paramsArray[1];

				const mediaType = paramsArray[2];

				const matchMedia = window.matchMedia(paramsArray[0]);

				// Объекты с нужными условиями
				const spoilersArray = breakpointsArray.filter(function (item) {
					if (item.value === mediaBreakpoint && item.type === mediaType) {
						return true;
					}
				});

				// Событие
				matchMedia.addEventListener('change', function () {
					initSpoilers(spoilersArray, matchMedia);
				});

				initSpoilers(spoilersArray, matchMedia);
			});
		}
	}

	// Инициализация
	function initSpoilers(spoilersArray, matchMedia = false) {
		spoilersArray.forEach(spoilersBlock => {
			spoilersBlock = matchMedia ? spoilersBlock.item : spoilersBlock;

			if (matchMedia.matches || !matchMedia) {
				spoilersBlock.classList.add('init');

				initSpoilerBody(spoilersBlock);

				spoilersBlock.addEventListener('click', setSpoilerAction);
			} else {
				spoilersBlock.classList.remove('init');

				initSpoilerBody(spoilersBlock, false);

				spoilersBlock.removeEventListener('click', setSpoilerAction);
			}
		});
	}

	// Работа с контентом
	function initSpoilerBody(spoilersBlock, hideSpoilerBody = true) {
		const spoilerTitles = spoilersBlock.querySelectorAll(
			'[data-spoiler-title]',
		);

		if (spoilerTitles.length > 0) {
			spoilerTitles.forEach(spoilerTitle => {
				if (hideSpoilerBody) {
					spoilerTitle.removeAttribute('tabindex');

					if (!spoilerTitle.classList.contains('active')) {
						const spoilerTitleParent = spoilerTitle?.closest('[data-spoiler]');

						if (spoilerTitleParent) {
							const targetContent = spoilerTitleParent.querySelector(
								'[data-spoiler-content]',
							);

							targetContent.hidden = true;
						}
					}
				} else {
					spoilerTitle.setAttribute('tabindex', '-1');

					const spoilerTitleParent = spoilerTitle?.closest('[data-spoiler]');

					if (spoilerTitleParent) {
						const targetContent = spoilerTitleParent.querySelector(
							'[data-spoiler-content]',
						);

						targetContent.hidden = false;
					}
				}
			});
		}
	}

	function setSpoilerAction(e) {
		const el = e.target;

		if (
			el.hasAttribute('data-spoiler-title') ||
			el.closest('[data-spoiler-title]')
		) {
			const spoilerTitle = el.hasAttribute('data-spoiler-title')
				? el
				: el.closest('[data-spoiler-title]');

			const spoilersBlock = spoilerTitle.closest('[data-spoilers-list]');

			const oneSpoiler = spoilersBlock.hasAttribute('data-one-spoiler')
				? true
				: false;

			if (!spoilersBlock.querySelectorAll('.slide').length) {
				if (oneSpoiler && !spoilerTitle.classList.contains('active')) {
					hideSpoilersBody(spoilersBlock);
				}

				spoilerTitle.classList.toggle('active');

				const spoilerTitleParent = spoilerTitle.closest('[data-spoiler]');

				const targetContent = spoilerTitleParent.querySelector(
					'[data-spoiler-content]',
				);

				slideToggle(targetContent, durationSpeed);
			}
			e.preventDefault();
		}
	}

	function hideSpoilersBody(spoilersBlock) {
		const spoilerActiveTitle = spoilersBlock.querySelector(
			'[data-spoiler-title].active',
		);

		const activeTitleParent = spoilerActiveTitle.closest('[data-spoiler]');

		const targetContent = activeTitleParent.querySelector(
			'[data-spoiler-content]',
		);

		if (spoilerActiveTitle) {
			spoilerActiveTitle.classList.remove('active');

			slideUp(targetContent, durationSpeed);
		}
	}
}

export default spoilers;
