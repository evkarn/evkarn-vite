import vars from '../vars.js';

import disableScroll from '../disable-scroll/disable-scroll.js';

import enableScroll from '../enable-scroll/enable-scroll.js';

function burgerInit() {
	'use strict';

	if (vars.burger && vars.nav) {
		vars.burger.addEventListener('click', () => {
			vars.burger.classList.toggle('burger--is-active');

			vars.nav.classList.toggle('nav--is-visible');

			vars.fixedEls.forEach(function (el) {
				el.classList.toggle('not-leap');
			});

			if (vars.burger.getAttribute('aria-expanded') === 'false') {
				vars.burger.setAttribute('aria-expanded', 'true');

				vars.burger.setAttribute('aria-pressed', 'true');

				vars.burger.setAttribute('aria-label', 'Закрыть меню');

				disableScroll();
			} else {
				vars.burger.setAttribute('aria-expanded', 'false');

				vars.burger.setAttribute('aria-pressed', 'false');

				vars.burger.setAttribute('aria-label', 'Открыть меню');

				enableScroll();
			}
		});
	}

	if (vars.navItems) {
		vars.navItems.forEach(el => {
			el.addEventListener('click', () => {
				enableScroll();

				if (vars.burger) {
					vars.burger.setAttribute('aria-expanded', 'false');

					vars.burger.setAttribute('aria-pressed', 'false');

					vars.burger.setAttribute('aria-label', 'Открыть меню');

					vars.burger.classList.remove('burger--is-active');
				}

				if (vars.nav) {
					vars.nav.classList.remove('nav--is-active');
				}
			});
		});
	}

	if (vars.overlay) {
		vars.overlay.addEventListener('click', () => {
			if (vars.burger) {
				vars.burger.setAttribute('aria-expanded', 'false');

				vars.burger.setAttribute('aria-pressed', 'false');

				vars.burger.setAttribute('aria-label', 'Открыть меню');

				vars.burger.classList.remove('burger--is-active');
			}

			if (vars.nav) {
				vars.nav.classList.remove('nav--is-active');
			}

			enableScroll();
		});
	}
}

export default burgerInit;
