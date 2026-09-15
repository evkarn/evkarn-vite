import FsLightbox from 'fslightbox';

export function lightbox() {
	fsLightboxInstances['portfolio'].props.onOpen = function () {
		disableScroll();
	};

	fsLightboxInstances['portfolio'].props.onClose = function () {
		enableScroll();
	};
}
