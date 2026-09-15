export function stepperSum() {
	'use strict';

	const steppers = document?.querySelectorAll('[data-stepper]');

	const inputs = document?.querySelectorAll('.cart-content .stepper__input');

	const cartFullPrice = document?.querySelector('[data-cart-full-price]');

	const priceWithoutSpaces = (str) => {
		return str.replace(/\s/g, '');
	};

	const normalPrice = (str) => {
		return String(str).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ');
	};

	if (inputs.length > 0) {
		inputs.forEach((input) => {
			if (input.value > 1) {
				const inputParent = input.closest('[data-stepper-wrapper]');

				const inputValue = input.value;

				const stepperPrice = inputParent.querySelector('[data-stepper-price]');

				const stepperPriceStr = priceWithoutSpaces(stepperPrice.innerText);

				const priceNew = +stepperPriceStr * +inputValue;

				stepperPrice.innerText = normalPrice(priceNew);

				cartFullPrice.innerText = normalPrice(priceNew);
			}
		});
	}

	steppers.forEach((stepper) => {
		stepper.addEventListener('click', (event) => {
			const evTarget = event.target;

			const parentTarget = evTarget.closest('[data-stepper-wrapper]');

			const input = parentTarget.querySelector('input');

			const priceOriginal = priceWithoutSpaces(
				parentTarget.querySelector('[data-stepper-original-price]').innerText,
			);

			let inputValue = input.value;

			let priceNew = normalPrice(inputValue * priceOriginal);

			let priceEl = parentTarget.querySelector('[data-stepper-price]');

			priceEl.innerText = priceNew;

			input.addEventListener('input', (event) => {
				let changeValue = input.value;

				let priceNew = normalPrice(changeValue * priceOriginal);

				priceEl.innerText = priceNew;
			});
		});
	});
}
