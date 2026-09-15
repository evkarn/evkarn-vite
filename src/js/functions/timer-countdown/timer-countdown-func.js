export function timerCountdown() {
	const timerBlock = document?.querySelector('[data-timer-countdown-parent]');

	const finish = document?.querySelector(
		'[data-timer-countdown-finish]',
	).textContent;

	if (timerBlock) {
		const newYear = new Date(`${finish}`);

		const daysVal = document.querySelector('[data-days-val]');

		const hoursVal = document.querySelector('[data-hours-val]');

		const minutesVal = document.querySelector('[data-minutes-val]');

		const secondsVal = document.querySelector('[data-seconds-val]');

		const daysText = document.querySelector('[data-days-text]');

		const hoursText = document.querySelector('[data-hours-text]');

		const minutesText = document.querySelector('[data-minutes-text]');

		const secondsText = document.querySelector('[data-seconds-text]');

		function declOfNum(number, titles) {
			let cases = [2, 0, 1, 1, 1, 2];

			return titles[
				number % 100 > 4 && number % 100 < 20
					? 2
					: cases[number % 10 < 5 ? number % 10 : 5]
			];
		}

		const timeCount() {
			let now = new Date();

			let leftUntil = newYear - now;

			let days = Math.floor(leftUntil / 1000 / 60 / 60 / 24);

			let hours = Math.floor(leftUntil / 1000 / 60 / 60) % 24;

			let minutes = Math.floor(leftUntil / 1000 / 60) % 60;

			let seconds = Math.floor(leftUntil / 1000) % 60;

			daysVal.textContent = days;

			hoursVal.textContent = hours;

			minutesVal.textContent = minutes;

			secondsVal.textContent = seconds;

			daysText.textContent = declOfNum(days, ['День', 'Дня', 'Дней']);

			hoursText.textContent = declOfNum(hours, ['Час', 'Часа', 'Часов']);

			minutesText.textContent = declOfNum(minutes, [
				'Минута',
				'Минуты',
				'Минут',
			]);

			secondsText.textContent = declOfNum(seconds, [
				'Секунда',
				'Секунды',
				'Секунд',
			]);
		};
		timeCount();
		setInterval(timeCount, 1000);
	}
}
