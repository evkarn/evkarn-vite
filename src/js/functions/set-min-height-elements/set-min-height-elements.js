function setMinHeightElements(selector) {
	'use strict';

	const elements = document?.querySelectorAll(`${selector}`);

	console.log(elements);

	if (!elements) {
		return;
	}

	elements.forEach(function (el, index, array) {
		const maxHeight = Math.max(...Array.from(el).map(el => el.offsetHeight));

		Object.assign(el.style, {
			minHeight: `${maxHeight}`,
		});
	});
}

export default setMinHeightElements;
