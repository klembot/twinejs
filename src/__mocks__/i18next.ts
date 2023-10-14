interface MockI18n {
	addResourceBundle: jest.Mock;
	changeLanguage: jest.Mock;
	createInstance: jest.Mock;
	init: jest.Mock;
	t: (value: string) => string;
	use: jest.Mock;
}

const i18n: MockI18n = {
	addResourceBundle: jest.fn(() => i18n),
	changeLanguage: jest.fn(() => i18n),
	createInstance: jest.fn(() => i18n),
	init: jest.fn(() => i18n),
	// Unclear why this needs to be a literal function and not a mock. Possibly
	// caused by using restoreMocks globally.
	t: (value: string) => value,
	use: jest.fn(() => i18n)
};

export default i18n;
