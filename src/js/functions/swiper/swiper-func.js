import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';

function initSwipers() {
	'use strict';

	const swiperElOne = document?.querySelector('.portfolio-slider');

	if (swiperElOne) {
		const swiperPortfolio = new Swiper('.portfolio-slider', {
			modules: [Navigation],

			navigation: {
				nextEl: '.swiper-button-next',
				prevEl: '.swiper-button-prev',
			},

			slidesPerView: '4',

			spaceBetween: 24,

			breakpoints: {
				// when window width is >= 320px
				320: {
					slidesPerView: 1,
					spaceBetween: 0,
				},
				544: {
					slidesPerView: 2,
					spaceBetween: 20,
				},
				// when window width is >= 480px
				900: {
					slidesPerView: 3,
					spaceBetween: 24,
				},
				// when window width is >= 640px
				1200: {
					slidesPerView: 4,
					spaceBetween: 24,
				},
			},
		});
	}
}

export default initSwipers;
