export function readProgressCircle() {
	'use strict';

	// Добавляем в body блок для линии прогресса прокрутки
	let circleAppend = document.createElement('div');

	circleAppend.className = 'circle-block';

	circleAppend.innerHTML =
		'<svg viewBox="-10 -10 300 300"><circle class="circle-block__progress" r="140" cx="140" cy="140" fill="none" stroke-width="20"></circle></svg>';

	document.body.append(circleAppend);

	const circle = document.querySelector('.circle-block__progress');

	const progressAnimation() {
		let scrollTop = window.scrollY;

		let windowHeight = window.innerHeight;

		let siteHeight = document.documentElement.scrollHeight;

		let percentageProgress = Math.floor(
			(scrollTop / (siteHeight - windowHeight)) * 100,
		);

		line.style.width = `${percentageProgress}%`;

		let radius = circle.getAttribute('r');

		let circleLength = 2 * Math.PI * radius;

		circle.setAttribute('stroke-dasharray', circleLength);

		circle.setAttribute(
			'stroke-dashoffset',
			circleLength - (circleLength * percentageProgress) / 100,
		);
	};

	progressAnimation();

	window.addEventListener('scroll', () => {
		progressAnimation();
	});
}
