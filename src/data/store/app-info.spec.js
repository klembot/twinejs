describe('app-info data module', () => {
	let appInfo;

	beforeEach(() => {
		let htmlEl = document.querySelector('html');

		htmlEl.setAttribute('data-app-name', 'Testing Twine');
		htmlEl.setAttribute('data-version', '-1.5');
		htmlEl.setAttribute('data-build-number', '12345');

		appInfo = require('./app-info');
	});

	afterEach(() => {
		let htmlEl = document.querySelector('html');

		htmlEl.removeAttribute('data-app-name');
		htmlEl.removeAttribute('data-app-version');
		htmlEl.removeAttribute('data-app-build-number');
	});

	test('sets a name property based on the <html> element', () => {
		expect(appInfo.state.name).toBe('Testing Twine');
	});

	test('sets an version property based on the <html> element', () => {
		expect(appInfo.state.version).toBe('-1.5');
	});

	test('sets a buildNumber property based on the <html> element', () => {
		expect(appInfo.state.buildNumber).toBe(12345);
	});
});

