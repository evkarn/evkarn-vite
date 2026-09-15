export function showMore() {
	'use strict';

	const showMoreBody = document?.querySelector('[data-show-more-body]');

	const showMoreList = document?.querySelector('[data-show-more-list]');

	let itemsActiveAmount = +showMoreBody?.querySelector(
		'[data-sm-items-visible]',
	).textContent;

	const itemActiveAdd =
		+showMoreBody?.querySelector('[data-sm-item-add]').textContent;

	const hideMoreItems = (selector) => {
		if (selector.length > itemsActiveAmount) {
			const arr = Array.from(selector);

			const hiddenItems = arr.slice(itemsActiveAmount, selector.length);

			hiddenItems.forEach((el) => {
				el.classList.remove('is-visible');
			});
		}
	};

	if (showMoreBody) {
		const showMoreItems = showMoreList.children;

		const arrayItems = Array.from(showMoreItems);

		const showMoreButton = document?.querySelector('[data-show-more-button]');

		hideMoreItems(showMoreItems);

		arrayItems.forEach(function (item, index, array) {
			if (index < itemsActiveAmount) {
				item.classList.add('is-visible');
			}
		});

		showMoreButton.addEventListener('click', () => {
			itemsActiveAmount += itemActiveAdd;

			arrayItems.forEach((el) => {
				if (!el.classList.contains('is-visible')) {
					el.classList.add('is-visible');
				}
			});

			hideMoreItems(showMoreItems);

			const visibleItems = document?.querySelectorAll(
				'[data-show-more-item].is-visible',
			);

			if (visibleItems.length === showMoreItems.length) {
				showMoreButton.style.display = 'none';
			}
		});
	}
}
