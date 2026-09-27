import justValidate from 'just-validate';

function validationForms() {
	'use strict';

	// Обработчик лежит рядом со страницей, поэтому путь относительный:
	// абсолютный /mail-uni.php при выкладке в подпапку (example.ru/site/)
	// ушёл бы в корень домена и отдавал 404
	const MAIL_HANDLER = 'mail-uni.php';

	// СЛОВАРЬ ПРАВИЛ ПО ТИПАМ ПОЛЕЙ
	const fieldRulesMap = {
		'text': () => [
			{ rule: 'required', value: true, errorMessage: 'Введите имя' },
			{ rule: 'minLength', value: 3, errorMessage: 'Минимум 3 символа' },
		],

		'email': () => [
			{ rule: 'required', value: true, errorMessage: 'E-mail обязателен' },
			{ rule: 'email', value: true, errorMessage: 'Введите корректный Email' },
		],

		'tel': (formElement, fieldSelector) => [
			{ rule: 'required', value: true, errorMessage: 'Телефон обязателен' },
			{
				rule: 'function',
				validator: function () {
					const input = formElement.querySelector(fieldSelector);

					if (!input) return false;

					// берём значение поля и считаем цифры
					const phone = input.value.replace(/\D/g, '');

					return phone.length === 10;
				},
				errorMessage: 'Введите корректный телефон',
			},
		],

		'checkbox': () => [
			{
				rule: 'required',
				value: true,
				errorMessage: 'Необходимо дать согласие на обработку персональных данных'
			},
		],
	};

	// КОНФИГУРАЦИЯ ВСЕХ ФОРМ (новые формы добавляются ниже, как вложенный в массив объект)
	const formsConfig = [
		{
			selector: '.contact-us__form',
			fields: [
				{ type: 'text', selector: '.input.input--name' },
				{ type: 'email', selector: '.input.input--email' },
				{ type: 'checkbox', selector: '.checkbox-input' },
			],
		},
	];

	// УНИВЕРСАЛЬНАЯ ИНИЦИАЛИЗАЦИЯ
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

		// Обработка отправки почтового сообщения
		const submitBtn = document?.querySelector('.form__button');

		// Адрес обработчика: action формы (или data-endpoint) относительно страницы
		const formAction = formElement.getAttribute('action');

		const endpoint = new URL(
			config.endpoint ||
			formElement.getAttribute('data-endpoint') ||
			(formAction && formAction !== '#' ? formAction : MAIL_HANDLER),
			document.baseURI,
		);

		// Вспомогательная функция: показать сообщение об успешной отправке или ошибке
		function showMessage(type, text) {
			// Удаляем старое сообщение, если есть
			const oldMsg = formElement.querySelector('.form__message');

			if (oldMsg) oldMsg.remove();

			// Создаём новое
			const messageEl = document.createElement('div');

			messageEl.className = `form__message form__message--${type} flex-center`;

			messageEl.innerHTML = `<p>${text}</p>`;

			// Вставляем после кнопки
			submitBtn.after(messageEl);

			// Авто-скрытие через 7 секунд (для успеха)
			if (type === 'succes') {
				setTimeout(() => {
					messageEl.remove();
				}, 7000);
			}
		}

		//Успешная валидация — отправляем
		validator.onSuccess(event => {
			event.preventDefault()

			console.log('Валидация пройдена, отправка...');

			// Блокируем кнопку
			const originalText = submitBtn.innerText;

			submitBtn.disabled = true;
			submitBtn.innerText = 'Отправка...';
			submitBtn.style.opacity = '0.7';

			const formData = new FormData(formElement);

			fetch(endpoint, {
				method: 'POST',
				body: formData,
				headers: { 'X-Requested-With': 'XMLHttpRequest' },
			})

				.then(async response => {
					if (!response.ok) {
						const text = await response.text();

						console.error(
							`Сервер вернул ${response.status}:`,
							text.substring(0, 200),
						);

						throw new Error(
							`Сервер вернул некорректный ответ (${response.status})`,
						);
					}

					const contentType = response.headers.get('content-type');

					if (!contentType || !contentType.includes('application/json')) {
						const text = await response.text();

						console.error(
							'Server returned non-JSON:',
							text.substring(0, 200),
						);

						throw new Error('Сервер вернул некорректный ответ');
					}
					return response.json();
				})

				.then(result => {
					if (result.success) {
						// Успех
						showMessage('succes', 'Заявка успешно отправлена!');

						formElement.reset();
					} else {
						// Ошибка от сервера
						showMessage(
							'error',
							'Ошибка отправки сообщения! Приносим извинения — попробуйте повторить чуть позже или позвоните нам по номеру: <a class="state-accent underline" href="tel:+70000000000">+7 (000) 000-00-00</a>.',
						);
					}
				})

				.catch(error => {
					console.error('Fetch error:', error);

					// Ошибка соединения
					showMessage(
						'error',
						'Ошибка отправки сообщения! Приносим извинения — попробуйте повторить чуть позже или позвоните нам по номеру: <a class="state-accent underline" href="tel:+70000000000">+7 (000) 000-00-00</a>.',
					);
				})

				.finally(() => {
					submitBtn.disabled = false;
					submitBtn.innerText = originalText;
					submitBtn.style.opacity = '1';
				});
		});

		// Ошибка валидации (опционально)
		validator.onFail(fields => {
			console.log('Валидация не пройдена:', fields);
		});

		// Очистка сообщения при начале ввода
		formElement.addEventListener('input', () => {
			const msg = formElement.querySelector('.form__message');

			if (msg) msg.remove();
		});
	});
};

export default validationForms();
