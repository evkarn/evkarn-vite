import SimpleBar from 'simplebar';

export function simpleBarFunction() {
	'use strict';

	const element = document?.querySelector('[data-simple-bar]');

	if (element) {
		new SimpleBar(element, {});
	}
};

export function simpleBarArrayFunction() {
	'use strict';

	const elements = document?.querySelectorAll('[data-simple-bar-for-array]');

	if (element) {
		Array.prototype.forEach.call(elements, (el) => new SimpleBar({}));
	}
};
