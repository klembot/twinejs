import {getAppInfo} from '../app-info';

describe('getAppInfo', () => {
	beforeAll(() => {
		import.meta.env.APP_NAME = 'mock-app-name';
		import.meta.env.APP_VERSION = '1.2.3';
	});

	afterAll(() => {
		delete import.meta.env.APP_NAME;
		delete import.meta.env.APP_VERSION;
	});

	it('reads information from the environment', () =>
		expect(getAppInfo()).toEqual({
			name: 'mock-app-name',
			version: '1.2.3'
		}));
});
