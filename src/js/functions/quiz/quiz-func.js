export function quiz() {
	'use strict';

	const progressLine = document?.querySelector('[data-progress-line]');

	const progressItems = document?.querySelectorAll('[data-progress-item]');

	const stepsItems = document?.querySelectorAll('[data-steps-item]');

	const quizNavButtonsBlock = document?.querySelector('[data-nav-buttons]');

	const prevBtn = document?.querySelector('[data-nav-button-prev]');

	const nextBtn = document?.querySelector('[data-nav-button-next]');

	const formQuiz = document?.querySelector('[data-quiz-form]');

	const quizStepsBlock = document?.querySelector('[data-quiz-steps]');

	const finishBlock = document?.querySelector('[data-quiz-finish]');

	// Отменяем стандартное поведение формы, чтобы она не отправлялась
	formQuiz.addEventListener('submit', (e) => e.preventDefault());

	let formStepIndex = 0;

	prevBtn.addEventListener('click', () => {
		formStepIndex--;

		progressItems[formStepIndex + 1].classList.remove('progress__item--active');

		updateFormStepIndex();
	});

	nextBtn.addEventListener('click', () => {
		if (formStepIndex < stepsItems.length - 1) {
			formStepIndex++;

			updateFormStepIndex();
		}
	});

	function updateFormStepIndex() {
		stepsItems.forEach((step) => {
			step.classList.contains('item--active');

			step.classList.remove('item--active');
		});

		stepsItems[formStepIndex].classList.add('item--active');

		progressItems[formStepIndex].classList.add('progress__item--active');

		if (formStepIndex === 0) {
			prevBtn.classList.add('nav-button__disabled');
		} else {
			prevBtn.classList.remove('nav-button__disabled');
		}

		if (formStepIndex === stepsItems.length - 1) {
			nextBtn.innerText = 'Finish';

			nextBtn.addEventListener('click', () => {
				finishBlock.style.display = 'block';

				quizStepsBlock.style.display = 'none';

				quizNavButtonsBlock.style.display = 'none';
			});
		} else {
			nextBtn.innerText = 'Next';
		}

		const activesProgressItems = document?.querySelectorAll(
			'.progress__item--active',
		);

		const percentProgressLine =
			((activesProgressItems.length - 1) / (progressItems.length - 1)) * 100 +
			'%';

		progressLine.style.width = percentProgressLine;
	}

	if (formQuiz) {
		updateFormStepIndex();
	}
}
