import {state} from '../app-info';

describe('app-info data module', () => {
	beforeEach(() => {
		let htmlEl = document.querySelector('html');

		htmlEl.setAttribute('data-app-name', 'Testing Twine');
		htmlEl.setAttribute('data-version', '-1.5');
		htmlEl.setAttribute('data-build-number', '12345');
	});

	afterEach(() => {
		let htmlEl = document.querySelector('html');

		htmlEl.removeAttribute('data-app-name');
		htmlEl.removeAttribute('data-app-version');
		htmlEl.removeAttribute('data-app-build-number');
	});

	it('sets a name property based on the <html> element', () => {
		expect(state().name).toBe('Testing Twine');
	});

	it('sets an version property based on the <html> element', () => {
		expect(state().version).toBe('-1.5');
	});

	it('sets a buildNumber property based on the <html> element', () => {
		expect(state().buildNumber).toBe(12345);
	});
});
