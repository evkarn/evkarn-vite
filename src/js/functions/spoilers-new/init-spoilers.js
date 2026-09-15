/**
 * Инициализирует спойлеры/аккордеоны на основе data-атрибутов.
 * data-max="576" — инициализация при максимальной ширине 576, не использовать вместе с data-min.
 * data-min="576" — инициализация при минимальной ширине 576, не использовать вместе с data-max.
 * data-mode="single" — открыт может быть только 1 спойлер.
 * Настраивает адаптивное раскрытие, делегирование событий и режим "один открыт".
 *
 * @param {string} [selector='[data-spoilers]'] - CSS-селектор контейнеров спойлеров
 * @returns {void}
 */
export function initSpoilers() {
	document.querySelectorAll('[data-spoilers]').forEach(container => {
		const min = container.dataset.min
			? parseFloat(container.dataset.min)
			: null;
		const max = container.dataset.max
			? parseFloat(container.dataset.max)
			: null;
		const isSingle = container.dataset.mode === 'single';
		let mq = null;

		// 1. Responsive-активация
		if (min === null && max === null) {
			container.classList.add('is-active');
		} else {
			const parts = [];
			if (min !== null) parts.push(`(min-width: ${min}px)`);
			if (max !== null) parts.push(`(max-width: ${max}px)`);

			mq = window.matchMedia(parts.join(' and '));
			container.classList.toggle('is-active', mq.matches);
			mq.addEventListener('change', e =>
				container.classList.toggle('is-active', e.matches),
			);
		}

		// 2. Один слушатель на контейнер (делегирование)
		container.addEventListener('click', e => {
			if (!container.classList.contains('is-active')) return;

			const trigger = e.target.closest('[data-spoilers-trigger]');
			if (!trigger || !container.contains(trigger)) return;

			const item = trigger.closest('[data-spoilers-item]');
			const content = item.querySelector('[data-spoilers-content]');
			const isOpen = content.classList.contains('open');

			// Режим "один открыт"
			if (isSingle && !isOpen) {
				container
					.querySelectorAll('[data-spoilers-content].open')
					.forEach(openContent => {
						openContent.classList.remove('open');
						openContent
							.closest('[data-spoilers-item]')
							.querySelector('[data-spoilers-trigger]')
							.setAttribute('aria-expanded', 'false');
					});
			}

			content.classList.toggle('open', !isOpen);
			trigger.setAttribute('aria-expanded', !isOpen);
		});
	});
}
