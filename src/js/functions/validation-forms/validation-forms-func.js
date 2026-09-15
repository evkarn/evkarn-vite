import justValidate from 'just-validate';

export function validationForms() {
	'use strict';

	const formCallback = document?.querySelector('.form--callback');

	const formCalculation = document?.querySelector('.modal-calculation__form');

	const formSale = document?.querySelector('.sale__form');

	const formOrder = document?.querySelector('.edit-profile__form');

	const formSubscribe = document?.querySelector('.site-footer__form');

	if (formSale) {
		const validateForm = new justValidate('.sale__form');

		validateForm
			.addField('.form__input--name', [
				{
					rule: 'minLength',
					value: 3,
				},
				{
					rule: 'maxLength',
					value: 30,
				},
			])
			.addField('.form__input--tel', [
				{
					rule: 'required',
					value: true,
					errorMessage: 'Телефон обязателен',
				},
				{
					rule: 'function',

					validator: function () {
						const telSelector = formSale.querySelector('.form__input--tel');

						const phone = telSelector.inputmask.unmaskedvalue();
						return phone.length === 10;
					},
					errorMessage: 'Введите корректный телефон',
				},
			]);
	}

	if (formCalculation) {
		const validateForm = new justValidate('.modal-calculation__form');

		validateForm
			.addField('.form__input--name', [
				{
					rule: 'minLength',
					value: 3,
				},
				{
					rule: 'maxLength',
					value: 30,
				},
			])
			.addField('.form__input--tel', [
				{
					rule: 'required',
					value: true,
					errorMessage: 'Телефон обязателен',
				},
				{
					rule: 'function',

					validator: function () {
						const telSelector =
							formCalculation.querySelector('.form__input--tel');

						const phone = telSelector.inputmask.unmaskedvalue();
						return phone.length === 10;
					},
					errorMessage: 'Введите корректный телефон',
				},
			]);
	}

	if (formCallback) {
		const validateForm = new justValidate('.form--callback');

		validateForm
			.addField('.form__input--name', [
				{
					rule: 'minLength',
					value: 3,
				},
				{
					rule: 'maxLength',
					value: 30,
				},
			])
			.addField('.form__input--tel', [
				{
					rule: 'required',
					value: true,
					errorMessage: 'Телефон обязателен',
				},
				{
					rule: 'function',

					validator: function () {
						const telSelector = formCallback.querySelector('.form__input--tel');

						const phone = telSelector.inputmask.unmaskedvalue();
						return phone.length === 10;
					},
					errorMessage: 'Введите корректный телефон',
				},
			]);
	}

	if (formSubscribe) {
		const validateSubscribeForm = new justValidate('.site-footer__form');

		validateSubscribeForm.addField('.form__input--email', [
			{
				rule: 'required',
				value: true,
				errorMessage: 'E-mail обязателен',
			},
			{
				rule: 'email',
				value: true,
				errorMessage: 'Введите корректный Email',
			},
		]);
	}
}
