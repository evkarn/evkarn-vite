	(function cookieNote() {
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
	})();

	// Отслеживание целей Яндекс.Метрики
	(function metricsTargetsWatch() {
		'use strict';

		// 1. Проверяем ТОЛЬКО наличие глобальной переменной с ID.
		// Если её нет, значит, администратор не заполнил поле в Carbon Fields.
		if (typeof window.YA_COUNTER_ID === 'undefined') {
			console.warn(
				'ID счетчика (window.YA_COUNTER_ID) не найден. Отслеживание целей отменено.',
			);
			return;
		}

		console.log(
			'Отслеживание целей настроено и готово к работе (ID:',
			window.YA_COUNTER_ID,
			')',
		);

		// Вспомогательная функция для безопасной отправки цели
		// Она проверит наличие ym прямо в момент клика/события
		function sendGoal(goalName, params = {}) {
			if (typeof ym === 'function') {
				ym(window.YA_COUNTER_ID, 'reachGoal', goalName, params);
				console.log('✅ Цель отправлена:', goalName, params);
			} else {
				// Метрика еще не загрузилась или не инициализирована.
				// Молча игнорируем, чтобы не ломать логику сайта ошибками в консоли.
				console.log('⏳ Метрика не готова, цель', goalName, 'пропущена');
			}
		}

		// ==========================================
		// 2. Отслеживание отправок с форм Contact Form 7
		// ==========================================
		document.addEventListener(
			'wpcf7mailsent',
			function (event) {
				const formId = String(event.detail.contactFormId);
				let goalName = 'cf7_form_sent'; // Цель по умолчанию

				switch (formId) {
					case 'cedf301':
						goalName = 'cf7_form_quiz';
						break;
					case 'e62dbea':
						goalName = 'cf7_form_audit_already_ads';
						break;
					case 'c9ebe9e':
						goalName = 'cf7_form_general_section';
						break;
					case '73b6b3d':
						goalName = 'cf7_form_consult';
						break;
					case 'fc39cc2':
						goalName = 'cf7_form_consult_advantages_seo';
						break;
					case '61abe60':
						goalName = 'cf7_form_consult_modal';
						break;
					case 'ed80316':
						goalName = 'cf7_form_chat_bot';
						break;
					case '7bb010f':
						goalName = 'cf7_form_footer';
						break;
					case '8c43224':
						goalName = 'cf7_form_consult_manager';
						break;
					case '1929bb1':
						goalName = 'cf7_form_section_services';
						break;
				}

				sendGoal(goalName, { form_id: formId });
			},
			false,
		);

		// ==========================================
		// 3. Отслеживание кликов по ссылкам на соцсети
		// ==========================================
		const socialsContainer = document.querySelector('.socials');
		if (socialsContainer) {
			socialsContainer.addEventListener('click', function (event) {
				const link = event.target.closest('[data-social]');
				if (!link) return;

				const socialType = link.getAttribute('data-social');
				sendGoal('social_' + socialType);

				// Если ссылка открывается в той же вкладке, даем 200мс на отправку цели
				if (link.target !== '_blank') {
					event.preventDefault();
					setTimeout(() => {
						window.location.href = link.href;
					}, 200);
				}
			});
		} else {
			console.warn('Контейнер соцсетей (.socials) не найден');
		}

		// ==========================================
		// 4. Отслеживание кликов по телефонным ссылкам
		// ==========================================
		const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
		if (phoneLinks.length > 0) {
			phoneLinks.forEach(link => {
				link.addEventListener('click', function () {
					const phoneNumber = this.href.replace('tel:', '');
					sendGoal('phone_click', { phone: phoneNumber });
				});
			});
			console.log(
				'📞 Отслеживание телефонов активировано. Найдено ссылок:',
				phoneLinks.length,
			);
		}

		// ==========================================
		// 5. Отслеживание кликов по ссылкам на электронную почту
		// ==========================================
		const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
		if (emailLinks.length > 0) {
			emailLinks.forEach(link => {
				link.addEventListener('click', function () {
					const emailAddress = this.href.replace('mailto:', '');
					sendGoal('email_click', { email: emailAddress });
				});
			});
			console.log(
				'📧 Отслеживание email активировано. Найдено ссылок:',
				emailLinks.length,
			);
		}
	})();


/**
 * 🚨 РЕЗЕРВНАЯ КОПИЯ: Код инициализации Яндекс.Метрики
 *
 * Если что-то сломалось в настройках аналитики:
 * 1. Скопируйте этот код целиком
 * 2. Вставьте в поле "Код счётчиков (JS)" в настройках темы
 * 3. Замените 21829603 на ваш реальный ID счётчика (в 3 местах)
 * 4. Либо возьмите код между тегами <script></script> в Яндекс.Метрике и замените им код между комментариями: Стандартный код загрузки Яндекс.Метрики; Конец стандартного кода. И замените номер счётчика в этой строке: ym(21829603, 'reachGoal', 'metrica_consent_given');
 * 6. Скопируйте весь код, вставьте его в поле на сайте и сохраните настройки.
 *
 * Важно: этот код загружает Метрику ТОЛЬКО после нажатия кнопки согласия в окошке согласия с обработкой cookies!
 */

<script>
document.addEventListener('DOMContentLoaded', function () {
    // Флаг, чтобы предотвратить повторную инициализацию при множественных кликах
    let isMetrikaInitialized = false;

    function initYandexMetrika() {
        if (isMetrikaInitialized) {
            return;
        }

        isMetrikaInitialized = true;

        // Стандартный код загрузки Яндекс.Метрики
        (function (m, e, t, r, i, k, a) {
            m[i] =
                m[i] ||
                function () {
                    (m[i].a = m[i].a || []).push(arguments);
                };
            m[i].l = 1 * new Date();
            for (var j = 0; j < document.scripts.length; j++) {
                if (document.scripts[j].src === r) {
                    return;
                }
            }
            ((k = e.createElement(t)),
                (a = e.getElementsByTagName(t)[0]),
                (k.async = 1),
                (k.src = r),
                a.parentNode.insertBefore(k, a));
        })(
            window,
            document,
            'script',
            'https://mc.yandex.ru/metrika/tag.js?id=21829603',
            'ym',
        );

        // Инициализация счётчика
        ym(21829603, 'init', {
            ssr: true,
            webvisor: true,
            clickmap: true,
            referrer: document.referrer,
            url: location.href,
            accurateTrackBounce: true,
            trackLinks: true,
        });

        console.log('Яндекс.Метрика успешно активирована');

        // Отправить событие о том, что пользователь дал согласие
        ym(21829603, 'reachGoal', 'metrica_consent_given');
    }

    // Проверка: если согласие уже было дано (есть cookie), запускаем метрику автоматически
    function checkExistingConsent() {
        const hasConsent = document.cookie
            .split(';')
            .some(c => c.trim().startsWith('cookieConsent='));

        if (hasConsent) {
            console.log('Согласие уже было дано ранее, запускаем метрику автоматически');
            initYandexMetrika();
        }
    }

    // Проверяем существующее согласие при загрузке страницы
    checkExistingConsent();

    const consentBtn = document?.querySelector('[data-cookie-popup-btn]');

    if (consentBtn) {
        consentBtn.addEventListener('click', initYandexMetrika);
    } else {
        console.warn("Кнопка согласия не найдена. Проверьте селектор.");
    }
});
</script>
