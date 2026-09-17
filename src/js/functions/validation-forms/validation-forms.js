import justValidate from 'just-validate';
import IMask from 'imask';

function validationForms() {
	'use strict';

	// ==========================================
	// 1. БАЗОВЫЕ ПРАВИЛА
	// ==========================================

	const nameRules = [
		{ rule: 'required', value: true, errorMessage: 'Введите имя' },
		{ rule: 'minLength', value: 3, errorMessage: 'Минимум 3 символа' },
		{ rule: 'maxLength', value: 30, errorMessage: 'Максимум 30 символов' },
	];

	const emailRules = [
		{ rule: 'required', value: true, errorMessage: 'E-mail обязателен' },
		{ rule: 'email', value: true, errorMessage: 'Введите корректный Email' },
	];

	// ==========================================
	// 2. СЛОВАРЬ ПРАВИЛ ПО ТИПАМ ПОЛЕЙ
	// ==========================================

	const fieldRulesMap = {
		'text': () => nameRules,

		'email': () => emailRules,

		'tel': (formElement, fieldSelector) => [
			{ rule: 'required', value: true, errorMessage: 'Телефон обязателен' },
			{
				rule: 'function',
				validator: function () {
					const input = formElement.querySelector(fieldSelector);
					if (!input) return false;

					const maskInstance = IMask.getInstance(input);
					const phone = maskInstance ? maskInstance.unmaskedValue : '';

					return phone.length === 10;
				},
				errorMessage: 'Введите корректный телефон',
			},
		],

		// ✨ НОВОЕ: Правило для чекбокса согласия
		'checkbox': () => [
			{
				rule: 'required',
				value: true,
				errorMessage: 'Необходимо дать согласие на обработку персональных данных'
			},
		],
	};

	// ==========================================
	// 3. КОНФИГУРАЦИЯ ВСЕХ ФОРМ
	// ==========================================

	const formsConfig = [
		{
			selector: '.sale__form',
			fields: [
				{ type: 'text', selector: '.form__input--name' },
				{ type: 'tel', selector: '.form__input--tel' },
				// Добавляем чекбокс туда, где он нужен
				{ type: 'checkbox', selector: '.form__input--agreement' },
			],
		},
		{
			selector: '.modal-calculation__form',
			fields: [
				{ type: 'text', selector: '.form__input--name' },
				{ type: 'tel', selector: '.form__input--tel' },
				{ type: 'checkbox', selector: '.form__input--agreement' },
			],
		},
		{
			selector: '.form--callback',
			fields: [
				{ type: 'text', selector: '.form__input--name' },
				{ type: 'tel', selector: '.form__input--tel' },
				{ type: 'checkbox', selector: '.form__input--agreement' },
			],
		},
		{
			selector: '.site-footer__form',
			fields: [
				{ type: 'email', selector: '.form__input--email' },
				// В футере чекбокс часто тоже нужен, добавляется одной строкой:
				// { type: 'checkbox', selector: '.form__input--agreement' },
			],
		},
	];

	// ==========================================
	// 4. УНИВЕРСАЛЬНАЯ ИНИЦИАЛИЗАЦИЯ
	// ==========================================

	formsConfig.forEach((config) => {
		const formElement = document.querySelector(config.selector);
		if (!formElement) return;

		const validator = new justValidate(config.selector);

		config.fields.forEach((field) => {
			const getRules = fieldRulesMap[field.type];

			if (getRules) {
				const rules = getRules(formElement, field.selector);
				validator.addField(field.selector, rules);
			} else {
				console.warn(`Неизвестный тип поля: ${field.type} в форме ${config.selector}`);
			}
		});
	});
}

export default validationForms();
