function inputPasswordShowHide() {
	'use strict';

	const buttonsShowHidePass = document?.querySelectorAll(
		'[data-show-hide-password]',
	);

	if (buttonsShowHidePass.length > 0) {
		buttonsShowHidePass.forEach((el) => {
			el.addEventListener('click', (e) => {
				e.target.classList.toggle('view-password');

				const targetParent = target.parentNode;

				const targetInput = targetParent.querySelector('input');

				if (targetInput.getAttribute('type') === 'password') {
					targetInput.setAttribute('type', 'text');
				} else {
					targetInput.setAttribute('type', 'password');
				}
			});
		});
	}
}

export default inputPasswordShowHide;
