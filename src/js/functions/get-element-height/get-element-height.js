export function getElementHeight(selector, varHeightName, threshold = 0.05) {
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
		const widthChanged = Math.abs(newWidth - lastWidth) / lastWidth > threshold;
		const orientationChanged = lastWidth > lastHeight !== newWidth > newHeight;

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
