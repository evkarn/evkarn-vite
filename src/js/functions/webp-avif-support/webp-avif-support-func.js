export function webpAvifSupport() {
	'use strict';

	// Проверка поддержки webp
	function testWebp(callback) {
		let webP = new Image();

		webP.onload = webP.onerror = function () {
			callback(webP.height == 2);
		};

		webP.src =
			'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
	}

	// Добавление класса webp или no-webp для html
	testWebp(function (support) {
		let className = support === true ? 'webp' : 'no-webp';

		document.documentElement.classList.add(className);
	});

	async function supportsAvif() {
		if (!this.createImageBitmap) return false;
		const avifData =
			'data:image/avif;base64,AAAAFGZ0eXBhdmlmAAAAAG1pZjEAAACgbWV0YQAAAAAAAAAOcGl0bQAAAAAAAQAAAB5pbG9jAAAAAEQAAAEAAQAAAAEAAAC8AAAAGwAAACNpaW5mAAAAAAABAAAAFWluZmUCAAAAAAEAAGF2MDEAAAAARWlwcnAAAAAoaXBjbwAAABRpc3BlAAAAAAAAAAQAAAAEAAAADGF2MUOBAAAAAAAAFWlwbWEAAAAAAAAAAQABAgECAAAAI21kYXQSAAoIP8R8hAQ0BUAyDWeeUy0JG+QAACANEkA=';
		const blob = await fetch(avifData).then((r) => r.blob());
		return createImageBitmap(blob).then(
			() => true,
			() => false,
		);
	}

	(async () => {
		const classAvif = (await supportsAvif()) ? 'avif' : 'no-avif';
		document.body.classList.add(classAvif);
	})();
}
