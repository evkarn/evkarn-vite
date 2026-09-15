function imageInBg() {
	'use strict';

	const html = document.documentElement;

	function testWebpAvif(callbackWebp, callbackAvif) {
		let webP = new Image();

		webP.onload = webP.onerror = function () {
			callbackWebp(webP.height == 2);
		};

		webP.src =
			'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
	}

	// Добавление класса webp или no-webp для html
	testWebpAvif(function (supportWebp, supportAvif) {
		let classNameWebp = supportWebp === true ? 'webp' : 'no-webp';

		html.classList.add(classNameWebp);

		if (supportWebp === true) {
			let ibg = document.querySelectorAll('[data-image-in-bg]');

			for (var i = 0; i < ibg.length; i++) {
				if (ibg[i].querySelector('picture')) {
					ibg[i].style.backgroundImage =
						'url(' +
						ibg[i]
							.querySelector('source[type="image/webp"]')
							.getAttribute('srcset') +
						')';
				}
			}
		} else {
			for (var i = 0; i < ibg.length; i++) {
				if (ibg[i].querySelector('img')) {
					ibg[i].style.backgroundImage =
						'url(' + ibg[i].querySelector('img').getAttribute('src') + ')';
				}
			}
		}
	});
}

export default imageInBg;
