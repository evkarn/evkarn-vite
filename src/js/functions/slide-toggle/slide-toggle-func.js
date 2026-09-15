import slideUp from '../slide-up/slide-up-func.js';
import slideDown from '../slide-down/slide-down-func.js';

function slideToggle(target, duration) {
	if (window.getComputedStyle(target).display === 'none') {
		return slideDown(target, duration);
	} else {
		return slideUp(target, duration);
	}
};

export default slideToggle;
