// Оптимизированные функции определения устройства
const deviceType = {
	mobile: () => window.innerWidth < 768,
	tablet: () => window.innerWidth >= 768 && window.innerWidth <= 1024,
	desktop: () => window.innerWidth > 1024,

	// Альтернативный вариант с единой точкой контроля
	current: () => {
		const width = window.innerWidth;
		if (width < 768) return 'mobile';
		if (width <= 1024) return 'tablet';
		return 'desktop';
	},
};

// Пример использования:
if (deviceType.mobile()) {
	// Мобильная логика
}

// Или с единой функцией:
const currentDevice = deviceType.current();

export default { isMobile, isTablet, isDesktop };
