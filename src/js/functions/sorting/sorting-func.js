export function sorting() {
	'use strict';

	var filterButtons = document?.querySelectorAll('[data-cat-filter-button]');

	var productBody = document?.querySelectorAll('[data-cat-product-list]');

	function insertAfter(elem, refElem) {
		return refElem.parentNode.insertBefore(elem, refElem.nextSibling);
	}

	function productSortMax(elSort, sortType) {
		for (let i = 0; i < elSort.children.length; i++) {
			for (let j = i; j < elSort.children.length; j++) {
				if (
					+elSort.children[i].getAttribute(sortType) >
					+elSort.children[j].getAttribute(sortType)
				) {
					var replacedNode = elSort.replaceChild(
						elSort.children[j],
						elSort.children[i],
					);

					insertAfter(replacedNode, elSort.children[i]);
				}
			}
		}
	}

	function productSortMin(elSort, sortType) {
		for (let i = 0; i < elSort.children.length; i++) {
			for (let j = i; j < elSort.children.length; j++) {
				if (
					+elSort.children[i].getAttribute(sortType) <
					+elSort.children[j].getAttribute(sortType)
				) {
					var replacedNode = elSort.replaceChild(
						elSort.children[j],
						elSort.children[i],
					);

					insertAfter(replacedNode, elSort.children[i]);
				}
			}
		}
	}

	if (productBody && filterButtons) {
		filterButtons.forEach((el) => {
			el.addEventListener('click', (e) => {
				var elTarget = e.target;

				const noProductBlock = document?.querySelector('[data-cat-no-product]');

				if (elTarget.dataset.catFilterButton === 'all') {
					var allProducts = document?.querySelectorAll('[data-cat-product]');

					noProductBlock.classList.remove('no-product--visible');

					if (allProducts.length > 0) {
						allProducts.forEach((el) => {
							el.classList.remove('is-product-hidden');
						});
					} else {
						noProductBlock.classList.add('no-product--visible');
					}
				}

				if (elTarget.dataset.catFilterButton === 'price-max') {
					var productList = document?.querySelector('[data-cat-product-list]');

					productSortMax(productList, 'data-sort-price');
				}

				if (elTarget.dataset.catFilterButton === 'price-min') {
					var productList = document?.querySelector('[data-cat-product-list]');

					productSortMin(productList, 'data-sort-price');
				}

				if (elTarget.dataset.catFilterButton === 'discount') {
					var productList = document?.querySelector('[data-cat-product-list]');

					productSortMin(productList, 'data-sort-discount');
				}

				if (elTarget.dataset.catFilterButton === 'rating') {
					var productList = document?.querySelector('[data-cat-product-list]');

					productSortMin(productList, 'data-sort-rating');
				}

				if (elTarget.dataset.catFilterButton === 'new') {
					var allProducts = document?.querySelectorAll('[data-cat-product]');

					var newProducts = document?.querySelectorAll('[data-sort-new]');

					noProductBlock.classList.remove('no-product--visible');

					allProducts.forEach((el) => {
						el.classList.add('is-product-hidden');

						el.classList.remove('is-product-visible');
					});

					newProducts.forEach((el) => {
						if (el.dataset.sortNew === 'true') {
							el.classList.remove('is-product-hidden');

							el.classList.add('is-product-visible');
						}
					});
				}

				if (elTarget.dataset.catFilterButton === 'premium') {
					var allProducts = document?.querySelectorAll('[data-cat-product]');

					var premiumProducts = document?.querySelectorAll(
						'[data-sort-premium]',
					);

					noProductBlock.classList.remove('no-product--visible');

					allProducts.forEach((el) => {
						el.classList.add('is-product-hidden');

						el.classList.remove('is-product-visible');
					});

					premiumProducts.forEach((el) => {
						if (el.dataset.sortPremium === 'true') {
							el.classList.remove('is-product-hidden');

							el.classList.add('is-product-visible');
						}
					});
				}

				if (elTarget.dataset.catFilterButton === 'sale') {
					var allProducts = document?.querySelectorAll('[data-cat-product]');

					var saleProducts = document?.querySelectorAll('[data-sort-sale]');

					noProductBlock.classList.remove('no-product--visible');

					allProducts.forEach((el) => {
						el.classList.add('is-product-hidden');

						el.classList.remove('is-product-visible');
					});

					saleProducts.forEach((el) => {
						if (el.dataset.sortSale === 'true') {
							el.classList.remove('is-product-hidden');

							el.classList.add('is-product-visible');
						}
					});
				}

				const productsVisible = document?.querySelectorAll(
					'.is-product-visible',
				);

				if (productsVisible.length < 1) {
					noProductBlock.classList.add('no-product--visible');
				}
			});
		});
	}
}
