export function setElementsMinHeight(parentSelector, elementsSelector) {
	'use strict';

	const parents = document.querySelectorAll(parentSelector);

	if (!parents) {
		return;
	}

	parents.forEach(function (el) {
		const currentElements = el.querySelectorAll(elementsSelector);

		if (!currentElements) {
			console.warn('No elements found!');

			return;
		}

		const arrayHeights = [];

		currentElements.forEach(el => {
			arrayHeights.push(el.offsetHeight);
		});

		const maxHeight = Math.max(...arrayHeights);

		currentElements.forEach(el => {
			el.style.minHeight = `${maxHeight}px`;
		});
	});
}
