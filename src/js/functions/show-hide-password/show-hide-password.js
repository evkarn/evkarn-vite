export function showHidePassword() {
	'use strict';

	const buttonsShowHidePass = document?.querySelectorAll(
		'[data-show-hide-password]',
	);

	if (buttonsShowHidePass.length > 0) {
		buttonsShowHidePass.forEach((el) => {
			el.addEventListener('click', (e) => {
				const target = e.target;

				target.classList.toggle('view-password--active');

				const targetParent = target.parentNode;

				const targetInputPassword =
					targetParent.querySelector('.input-password');

				if (targetInputPassword.getAttribute('type') === 'password') {
					targetInputPassword.setAttribute('type', 'text');
				} else {
					targetInputPassword.setAttribute('type', 'password');
				}
			});
		});
	}
}
