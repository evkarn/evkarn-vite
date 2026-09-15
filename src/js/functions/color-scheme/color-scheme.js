export function colorScheme() {
	'use strict';

	const darkSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
	const switcherRadios = document.querySelectorAll('.scheme-switcher__radio');
	const htmlElement = document.documentElement;

	// Получаем схему из localStorage или возвращаем 'auto' по умолчанию
	function getSavedScheme() {
		return localStorage.getItem('color-scheme') || 'auto';
	}

	// Сохраняем схему ровно в том виде, в котором она пришла (dark, light, auto)
	function saveScheme(scheme) {
		localStorage.setItem('color-scheme', scheme);
	}

	function applyTheme(scheme) {
		let shouldApplyDark = false;

		if (scheme === 'auto') {
			shouldApplyDark = darkSchemeMedia.matches;
		} else if (scheme === 'dark') {
			shouldApplyDark = true;
		}

		console.log('[color-scheme] applyTheme вызван:', {
			scheme,
			darkSchemeMediaMatches: darkSchemeMedia.matches,
			shouldApplyDark,
		});

		// БЕЗОПАСНОЕ управление классом: не затрагивает другие классы на <html>
		if (shouldApplyDark) {
			htmlElement.classList.add('dark-scheme');
		} else {
			htmlElement.classList.remove('dark-scheme');
		}

		console.log('[color-scheme] Результат:', {
			htmlClass: htmlElement.getAttribute('class'),
		});
	}

	function setScheme(scheme) {
		applyTheme(scheme);
		saveScheme(scheme);
	}

	function setupSwitcher() {
		const savedScheme = getSavedScheme();

		switcherRadios.forEach(radio => {
			// Синхронизируем состояние радио-кнопок с сохранённой схемой
			if (radio.value === savedScheme) {
				radio.checked = true;
			}

			radio.addEventListener('change', event => {
				setScheme(event.target.value);
			});
		});
	}

	function setupScheme() {
		const savedScheme = getSavedScheme();
		applyTheme(savedScheme);
	}

	// Слушаем изменения системной темы
	darkSchemeMedia.addEventListener('change', () => {
		const savedScheme = getSavedScheme();
		// Реагируем на изменения ОС только если пользователь выбрал 'auto'
		if (savedScheme === 'auto') {
			applyTheme('auto');
		}
	});

	setupSwitcher();
	setupScheme();
}

export default colorScheme;