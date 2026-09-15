function windowListenerResize(selector, varHeightName) {
	const documentRoot = document.querySelector(':root');

	window.addEventListener('resize', function () {
		const element = document?.querySelector(selector);

		if (element) {
			const elementHeight = element.offsetHeight;

			documentRoot.style.setProperty(elementHeight, `${topLineHeight}px`);
		}
	});
}
