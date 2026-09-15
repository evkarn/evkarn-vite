export function offsetPanelPhone() {
	'use strict';

	const calcHeight() {
		let verticalHeight = window.innerHeight;

		document.documentElement.style.setProperty(
			'--verticalHeight',
			`${verticalHeight}px`,
		);
	};

	calcHeight();

	window.addEventListener('resize', () => {
		calcHeight();
	});
}
