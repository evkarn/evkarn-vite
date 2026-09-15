function getFullYear(selector) {
	'use strict';

	const currentYear = new Date().getFullYear();

	const yearEl = document?.querySelector(selector);

	const metaYear = document?.querySelector('[itemprop="copyrightYear"]');

	if (yearEl) {
		yearEl.innerHTML = currentYear;
	}

	if (metaYear) {
		metaYear.setAttribute('content', currentYear);
	}
}

export default getFullYear;
