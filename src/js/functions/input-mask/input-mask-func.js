import inputmask from 'inputmask';

function inputMask() {
	'use strict';

	const itemsTel = document?.querySelectorAll('input[type="tel"]');

	if (itemsTel) {
		itemsTel.forEach(function (el) {
			Inputmask({ mask: `+7 (999) 999-99-99` }).mask(el);
		});
	}
}

export default inputMask;
