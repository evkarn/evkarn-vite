function digitalCounters(timeDuration) {
	'use strict';

	function digitalCountersInit(digitalCountersItems) {
		let digitalCounters = digitalCountersItems
			? digitalCountersItems
			: document.querySelectorAll('[data-digital-counter]');

		if (digitalCounters) {
			digitalCounters.forEach(elemDC => {
				digitalCountersAnimate(elemDC);
			});
		}
	}

	function digitalCountersAnimate(elemDC) {
		let startTimeDefault = null;

		const duration = parseFloat(elemDC.dataset.digitalCounter)
			? parseFloat(elemDC.dataset.digitalCounter)
			: timeDuration;

		// Получаем исходное значение как строку для определения формата
		const originalValue = elemDC.innerHTML.trim();
		const startValue = parseFloat(originalValue) || 0;
		const startPosition = 0;

		// Определяем, является ли исходное число целым или десятичным
		const isDecimal = originalValue.includes('.');

		// Если десятичное, определяем количество знаков после запятой
		let decimalPlaces = 0;
		if (isDecimal) {
			const decimalPart = originalValue.split('.')[1];
			decimalPlaces = decimalPart ? decimalPart.length : 0;
		}

		const step = timeDefault => {
			if (!startTimeDefault) startTimeDefault = timeDefault;

			const progress = Math.min((timeDefault - startTimeDefault) / duration, 1);

			const currentValue = progress * (startPosition + startValue);

			// Форматируем число в зависимости от типа
			if (isDecimal && decimalPlaces > 0) {
				// Для десятичных чисел сохраняем нули
				elemDC.innerHTML = currentValue.toFixed(decimalPlaces);
			} else {
				// Для целых чисел убираем нули
				elemDC.innerHTML = Math.round(currentValue).toString();
			}

			if (progress < 1) {
				window.requestAnimationFrame(step);
			}
		};
		window.requestAnimationFrame(step);
	}

	// Остальной код без изменений...
	let options = {
		threshold: 0.3,
	};

	let observer = new IntersectionObserver((entries, observer) => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				const targetElement = entry.target;
				const digitalCountersItems = targetElement.querySelectorAll(
					'[data-digital-counter]',
				);

				if (digitalCountersItems.length) {
					digitalCountersInit(digitalCountersItems);
				}

				observer.unobserve(targetElement);
			}
		});
	}, options);

	let sections = document.querySelectorAll('.section');
	if (sections.length) {
		sections.forEach(sec => {
			observer.observe(sec);
		});
	}
}
