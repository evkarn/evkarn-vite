function sliderSwitchImages() {
	const cards = document.querySelectorAll('[data-slider-images-card]');

	console.log(cards);

	if (cards) {
		cards.forEach((el) => {
			let currentCard = el;

			const imageSwitchItems = currentCard.querySelectorAll(
				'[data-slider-images-item]',
			);

			const imagesPagination = currentCard.querySelector(
				'[data-slider-images-pagination]',
			);

			if (imageSwitchItems.length > 1) {
				imageSwitchItems.forEach((el, index) => {
					el.setAttribute('data-index', index);

					imagesPagination.innerHTML += `<li class="pagination-images__item ${
						index == 0 ? 'is-active' : ''
					}" data-pag-index="${index}"></li>`;

					el.addEventListener('mouseenter', (e) => {
						const paginationItems = currentCard.querySelectorAll(
							'.pagination-images__item',
						);

						paginationItems.forEach((el) => {
							el.classList.remove('is-active');
						});

						const targetItem = currentCard.querySelector(
							`.pagination-images__item[data-pag-index="${e.currentTarget.dataset.index}"]`,
						);

						console.log(targetItem);

						targetItem.classList.add('is-active');
					});

					el.addEventListener('mouseleave', (e) => {
						const paginationItems = currentCard.querySelectorAll(
							'.pagination-images__item',
						);

						paginationItems.forEach((el) => {
							el.classList.remove('is-active');
						});
					});
				});
			}
		});
	}
}

export default sliderSwitchImages;
