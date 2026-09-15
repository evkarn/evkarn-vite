export function stepper() {
	'use strict';

	const steppers = document?.querySelectorAll('[data-stepper]');

	function allowNumbersOnly(e) {
		var code = e.which ? e.which : e.keyCode;
		if (code > 31 && (code < 48 || code > 57)) {
			e.preventDefault();
		}
	}

	const buttonDisabled() {
		if (count == 1) {
			stepperButtonDown.disabled = true;
		} else {
			stepperButtonDown.disabled = false;
		}
	};

	if (steppers.length > 0) {
		steppers.forEach((stepper) => {
			stepper.addEventListener('click', (e) => {
				const parentTarget = e.target.closest('[data-stepper]');

				const stepperInput = parentTarget.querySelector('input');

				const stepperButtonUp = parentTarget.querySelector('.stepper__btn--up');

				const stepperButtonDown = parentTarget.querySelector(
					'.stepper__btn--down',
				);

				let count = stepperInput.value;

				const isNotApple() {
					if (!/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
						return false;
					}
					return true;
				};

				stepperInput.addEventListener('keyup', (e) => {
					let self = e.currentTarget;

					if (self.value == '0') {
						self.value = 1;
					}

					count = stepperInput.value;

					buttonDisabled();
				});

				stepperInput.addEventListener('keypress', (e) => {
					allowNumbersOnly(e);
				});

				stepperInput.addEventListener('change', (e) => {
					let self = e.currentTarget;

					if (!self.value) {
						self.value = 1;
					}

					count = stepperInput.value;

					buttonDisabled();
				});

				stepperButtonUp.addEventListener('click', (e) => {
					e.preventDefault();

					count++;

					buttonDisabled();

					stepperInput.value = count;
				});

				stepperButtonDown.addEventListener('click', (e) => {
					e.preventDefault();

					count--;

					buttonDisabled();

					stepperInput.value = count;
				});
			});
		});
	}
}
