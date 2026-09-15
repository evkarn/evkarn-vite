// Используем для отсчёта времени миллисекунды
export function cookieNoteInMilliseconds() {
	'use strict';

	// Конфигурация (легко менять параметры)
	const COOKIE_CONFIG = {
		name: 'cookieConsent',
		value: 'true',
		days: 30,
		popupSelector: '[data-cookie-popup]',
		btnSelector: '[data-cookie-popup-btn]',
	};

	// Универсальные функции для работы с cookie
	const cookie = {
		set(name, value, days) {
			let expires = '';

			if (days) {
				const date = new Date();

				date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);

				expires = `; expires=${date.toUTCString()}`;
			}

			document.cookie = `${name}=${value || ''}${expires}; path=/; SameSite=Lax`;
		},

		get(name) {
			return (
				document.cookie
					.split(';')
					.map(c => c.trim())
					.find(c => c.startsWith(`${name}=`))
					?.split('=')[1] || null
			);
		},

		exists(name) {
			return document.cookie
				.split(';')
				.some(c => c.trim().startsWith(`${name}=`));
		},
	};

	// Основная логика
	function initCookiePopup() {
		const popup = document.querySelector(COOKIE_CONFIG.popupSelector);
		const btn = document.querySelector(COOKIE_CONFIG.btnSelector);

		if (!popup || !btn) return;

		// Если куки уже есть - скрываем popup
		if (cookie.exists(COOKIE_CONFIG.name)) {
			popup.style.display = 'none';
			return;
		}

		// Обработчик клика по кнопке
		const handleAccept = () => {
			cookie.set(COOKIE_CONFIG.name, COOKIE_CONFIG.value, COOKIE_CONFIG.days);

			popup.style.removeProperty('display');

			btn.removeEventListener('click', handleAccept);
		};

		btn.addEventListener('click', handleAccept);

		// Показываем popup, если он был скрыт в CSS
		popup.style.display = 'block';
	}

	initCookiePopup();
}

// Используем для отсчёта времени дни
export function cookieNoteInDays() {
	'use strict';

	// Конфигурация (легко менять параметры)
	const COOKIE_CONFIG = {
		name: 'cookieConsent',
		value: 'true',
		days: 30,
		popupSelector: '[data-cookie-popup]',
		btnSelector: '[data-cookie-popup-btn]',
	};

	// Универсальные функции для работы с cookie
	const cookie = {
		set(name, value, days) {
			let expires = '';

			if (days) {
				const date = new Date();
				date.setDate(date.getDate() + days);
				expires = `; expires=${date.toUTCString()}`;
			}

			document.cookie = `${name}=${value || ''}${expires}; path=/; SameSite=Lax`;
		},

		get(name) {
			return (
				document.cookie
					.split(';')
					.map(c => c.trim())
					.find(c => c.startsWith(`${name}=`))
					?.split('=')[1] || null
			);
		},

		exists(name) {
			return document.cookie
				.split(';')
				.some(c => c.trim().startsWith(`${name}=`));
		},
	};

	// Основная логика
	function initCookiePopup() {
		const popup = document.querySelector(COOKIE_CONFIG.popupSelector);
		const btn = document.querySelector(COOKIE_CONFIG.btnSelector);

		if (!popup || !btn) return;

		// Если куки уже есть - скрываем popup
		if (cookie.exists(COOKIE_CONFIG.name)) {
			popup.style.display = 'none';
			return;
		}

		// Обработчик клика по кнопке
		const handleAccept = () => {
			cookie.set(COOKIE_CONFIG.name, COOKIE_CONFIG.value, COOKIE_CONFIG.days);

			popup.style.removeProperty('display');

			btn.removeEventListener('click', handleAccept);
		};

		btn.addEventListener('click', handleAccept);

		// Показываем popup, если он был скрыт в CSS
		popup.style.display = 'block';
	}

	initCookiePopup();
}
