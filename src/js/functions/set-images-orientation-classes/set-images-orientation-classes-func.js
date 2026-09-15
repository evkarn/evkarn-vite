function setImagesOrientationClasses(selector = '.img') {
	// Находим все изображения по селектору
	const images = document.querySelectorAll(selector);

	// Обрабатываем каждое изображение
	images.forEach(img => {
		// Проверяем, является ли элемент изображением (на всякий случай)
		if (!(img instanceof HTMLImageElement)) return;

		// Если изображение уже загружено
		if (img.complete) {
			applyOrientationClass(img);
		} else {
			// Если еще не загружено, ждем загрузки
			img.addEventListener('load', function () {
				applyOrientationClass(img);
			});

			// На случай ошибки загрузки изображения
			img.addEventListener('error', function () {
				console.warn('Ошибка загрузки изображения', img.src);
			});
		}
	});

	function applyOrientationClass(img) {
		const width = img.naturalWidth;
		const height = img.naturalHeight;

		// Удаляем предыдущие классы ориентации
		img.classList.remove('img-horizontal', 'img-vertical', 'img-square');

		// Определяем ориентацию
		if (width > height) {
			img.classList.add('img-horizontal');
		} else if (width < height) {
			img.classList.add('img-vertical');
		} else {
			img.classList.add('img-square'); // для квадратных изображений
		}
	}
}
