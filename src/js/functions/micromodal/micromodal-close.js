(function initMicromodal() {
	function close(target) {
		if (!target.hasAttribute('data-modal-close')) return;

		const modal = target.closest('.modal');

		if (modal) MicroModal.close(modal.id);
	}

	document.body.addEventListener('mousedown', (e) => close(e.target));
	document.body.addEventListener('touchstart', (e) => close(e.target));
})();
