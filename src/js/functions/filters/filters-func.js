function filters() {
	'use strict';

	const filters = document?.querySelectorAll('[data-filter-body]');

	const buttonsShowMore = document?.querySelectorAll('[data-filter-show-more]');

	if (buttonsShowMore.length > 0) {
		buttonsShowMore.forEach((buttonShowMore) => {
			buttonShowMore.addEventListener('click', (e) => {
				const targetParent = e.target.closest('[data-filter-body]');

				const path = targetParent.querySelector(
					'[data-filter-button].is-active',
				).dataset.filterButton;

				const filterTargets = targetParent.querySelectorAll(
					'[data-filter-target]',
				);

				if (path != 'all') {
					const targetItems = targetParent.querySelectorAll(
						`[data-filter-target="${path}"]`,
					);

					targetItems.forEach((el) => {
						el.classList.add('is-visible-more');

						buttonShowMore.style.display = 'none';
					});
				} else {
					filterTargets.forEach((el) => {
						el.classList.add('is-visible-more');

						buttonShowMore.style.display = 'none';
					});
				}
			});
		});
	}

	if (filters.length > 0) {
		filters.forEach((filterBlock) => {
			filterBlock.addEventListener('click', (e) => {
				const targetParent = e.target.closest('[data-filter-body]');

				const itemsActiveAmount = Number(
					targetParent.dataset.activeItemsAmount,
				);

				const filterButtons = targetParent.querySelectorAll(
					'[data-filter-button]',
				);

				const filterTargets = targetParent.querySelectorAll(
					'[data-filter-target]',
				);

				const buttonShowMore = targetParent.querySelector(
					'[data-filter-show-more]',
				);

				const isButtonShowMoreNeeded = (selector) => {
					if (selector.length <= itemsActiveAmount && buttonShowMore) {
						buttonShowMore.style.display = 'none';
					} else if (buttonShowMore) {
						buttonShowMore.style.display = 'inline-flex';
					}
				};

				const hideMoreItems = (selector) => {
					if (selector.length > itemsActiveAmount) {
						const arr = Array.from(selector);

						const hiddenItems = arr.slice(itemsActiveAmount, selector.length);

						hiddenItems.forEach((el) => {
							el.classList.remove('is-visible');

							el.classList.remove('is-visible-more');
						});
					}
				};

				targetParent.addEventListener('click', (e) => {
					const target = e.target;

					if (target.closest('[data-filter-button]')) {
						const dataText = target.dataset.filterButton;

						const targetsWithDataText = targetParent.querySelectorAll(
							`[data-filter-target="${dataText}"]`,
						);

						const itemsVisible = targetParent.querySelectorAll('.is-visible');

						filterButtons.forEach((el) => {
							el.classList.remove('is-active');
						});

						target.classList.add('is-active');

						filterTargets.forEach((el) => {
							el.classList.remove('is-visible');

							el.classList.remove('is-visible-more');
						});

						targetsWithDataText.forEach((el) => {
							el.classList.add('is-visible');
						});

						isButtonShowMoreNeeded(targetsWithDataText);

						hideMoreItems(targetsWithDataText);

						if (dataText == 'all') {
							filterTargets.forEach((el) => {
								el.classList.add('is-visible');
							});

							let isVisibleEl = targetParent.querySelectorAll('.is-visible');

							isButtonShowMoreNeeded(isVisibleEl);

							hideMoreItems(isVisibleEl);
						}
					}
				});
			});
		});
	}
}

export default filters;
