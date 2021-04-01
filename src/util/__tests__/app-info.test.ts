import {getAppInfo} from '../app-info';

describe('getAppInfo', () => {
	let root: HTMLElement | null;

	beforeAll(() => {
		root = document.querySelector('html');

		if (!root) {
			throw new Error('Could not find <html> element');
		}

		root.dataset.appName = 'test-app-name';
		root.dataset.version = '1.2.3';
		root.dataset.buildNumber = '12345';
	});

	afterAll(() => {
		if (!root) {
			throw new Error('Could not find <html> element');
		}

		root.dataset.appName = undefined;
		root.dataset.version = undefined;
		root.dataset.buildNumber = undefined;
	});

	it('reads information from the <html> tag', () =>
		expect(getAppInfo()).toEqual({
			buildNumber: '12345',
			name: 'test-app-name',
			version: '1.2.3'
		}));
});
