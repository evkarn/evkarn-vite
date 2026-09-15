function readProgressLine() {
	'use strict';

	// Добавляем в body блок для линии прогресса прокрутки
	let lineAppend = document.createElement('div');

	lineAppend.className = 'progress-line';

	lineAppend.innerHTML = '<div class="progress-line__item"></div>';

	document.body.append(lineAppend);

	// Получаем внутренний элемент оболочки линии прогресса прокрутки
	const line = document.querySelector('.progress-line__item');

	function progressAnimation() {
		let scrollTop = window.scrollY;

		let windowHeight = window.innerHeight;

		let siteHeight = document.documentElement.scrollHeight;

		let percentageProgress = Math.floor(
			(scrollTop / (siteHeight - windowHeight)) * 100,
		);

		line.style.width = `${percentageProgress}%`;
	}

	progressAnimation();

	window.addEventListener('scroll', () => {
		progressAnimation();
	});
}

export default readProgressLine;
