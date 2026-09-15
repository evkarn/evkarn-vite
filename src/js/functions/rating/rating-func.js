export function rating() {
	'use strict';

	const ratings = document.querySelectorAll('[data-rating]');

	if (ratings.length > 0) {
		initRatings();
	}

	// Основная функция
	function initRatings() {
		let ratingActive;

		let ratingValue;

		// Отслеживаем все рейтинги на странице
		for (let index = 0; index < ratings.length; index++) {
			const rating = ratings[index];
			initRating(rating);
		}

		// Инициализируем конкретный рейтинг
		function initRating(rating) {
			initRatingVars(rating);

			setRatingActiveWidth();

			if (rating.classList.contains('rating--set')) {
				setRating(rating);
			}
		}

		// Инициализация переменных
		function initRatingVars(rating) {
			ratingActive = rating.querySelector('.rating__active');

			ratingValue = rating.querySelector('.rating__value');
		}

		// Изменение ширины активных звёзд
		function setRatingActiveWidth(index = ratingValue.innerText) {
			const ratingActiveWidth = index / 0.05;
			ratingActive.style.width = `${ratingActiveWidth}%`;
		}

		// Возможность указывать оценку
		function setRating(rating) {
			const ratingList = rating.querySelectorAll('.rating__item');

			for (let index = 0; index < ratingList.length; index++) {
				const ratingItem = ratingList[index];

				ratingItem.addEventListener('mouseenter', function (e) {
					// Обновление переменных
					initRatingVars(rating);

					// Обновление активных звёзд
					setRatingActiveWidth(ratingItem.value);
				});

				ratingItem.addEventListener('mouseleave', function (e) {
					// Обновление активных звёзд
					setRatingActiveWidth();
				});

				ratingItem.addEventListener('click', function (e) {
					// Обновление переменных
					initRatingVars(rating);

					if (rating.dataset.ajax) {
						// Отправить на сервер
						setRatingValue(ratingItem.value, rating);
					} else {
						// Отобразить указанную оценку
						ratingValue.innerText = index + 1;
						setRatingActiveWidth();
					}
				});
			}
		}

		async function setRatingValue(value, rating) {
			if (!rating.classList.contains('rating--sending')) {
				rating.classList.add('rating--sending');

				// Отправить данные (value) на сервер
				let response = await fetch('rating.json', {
					method: 'GET',

					// body: JSON.stringify({
					// 	userRating: value
					// }),

					// headers: {
					// 	'content-type': 'application/json; charset=utf-8'
					// }
				});

				if (response.ok) {
					const result = await response.json();

					// Получаем новый рейтинг
					const newRating = result.newRating;

					// Вывод нового среднего результата
					ratingValue.innerText = newRating;

					// Обновление активных звёзд
					setRatingActiveWidth();

					rating.classList.remove('rating--sending');
				} else {
					alert('Ошибка');

					rating.classList.remove('rating--sending');
				}
			}
		}
	}
}
