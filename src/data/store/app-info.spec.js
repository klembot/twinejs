const { expect } = require('chai');

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

	it('sets a name property based on the <html> element', () => {
		expect(appInfo.state.name).to.equal('Testing Twine');
	});

	it('sets an version property based on the <html> element', () => {
		expect(appInfo.state.version).to.equal('-1.5');
	});

	it('sets a buildNumber property based on the <html> element', () => {
		expect(appInfo.state.buildNumber).to.equal(12345);
	});
});

