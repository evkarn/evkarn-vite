import PhotoSwipeLightbox from '/photoswipe/photoswipe-lightbox.esm.js';

function photoSwipeInit() {
	const gallery = document?.querySelectorAll('[data-gallery]');
	const galleryItem = document?.querySelectorAll('[data-gallery-item]');

	if (gallery) {
		gallery.forEach((el) => {
			const lightbox = new PhotoSwipeLightbox({
				// may select multiple "galleries"
				gallery: el,

				// Elements within gallery (slides)
				children: '[data-gallery-item]',

				// setup PhotoSwipe Core dynamic import
				pswpModule: () => import('/photoswipe/photoswipe.esm.js'),
			});

			lightbox.init();
		});
	}

	if (galleryItem) {
		galleryItem.forEach((el) => {
			let img = new Image();
			let url = el.getAttribute('href');

			img.onload(function () {
				el.dataset.pswpWidth = this.width;
				el.dataset.pswpHeight = this.height;
			});

			img.src = url;
		});
	}
}

export default photoSwipeInit;
