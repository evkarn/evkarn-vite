function searchElements() {
	'use strict';

	const inputsSearch = document?.querySelectorAll('[data-modal-search]');

	inputsSearch.forEach(function (input) {
		input.oninput = function () {
			let val = this.value.trim().toLowerCase();

			const parent = input?.closest('[data-modal-data]');

			const content = parent?.querySelector('[data-simplebar]');

			const notFound = parent?.querySelector('[data-modal-not-found]');

			const elements = parent?.querySelectorAll('[data-modal-item]');

			const elementsHidden = parent?.querySelectorAll(
				'[data-modal-item].display-none',
			);

			if (val != '') {
				elements.forEach(function (el) {
					const dataText = el.dataset.modalItem;

					if (dataText.toLowerCase().search(val) == -1) {
						el.classList.add('display-none');
					} else {
						el.classList.remove('display-none');
					}
				});
			} else {
				elements.forEach(function (el) {
					el.classList.remove('display-none');
				});
			}

			if (elements.length == elementsHidden.length) {
				content.classList.add('display-none');

				notFound.classList.remove('display-none');
			} else {
				content.classList.remove('display-none');

				notFound.classList.add('display-none');
			}

			if (val.length == 0) {
				content.classList.remove('display-none');

				notFound.classList.add('display-none');

				elements.forEach(function (el) {
					el.classList.remove('display-none');
				});
			}
		};
	});
}

export default searchElements;
