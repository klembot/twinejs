import {getAppInfo} from '../app-info';

describe('getAppInfo', () => {
	beforeAll(() => {
		process.env.REACT_APP_NAME = 'mock-app-name';
		process.env.REACT_APP_VERSION = '1.2.3';
	});

	afterAll(() => {
		delete process.env.REACT_APP_NAME;
		delete process.env.REACT_APP_VERSION;
	});

	it('reads information from the environment', () =>
		expect(getAppInfo()).toEqual({
			name: 'mock-app-name',
			version: '1.2.3'
		}));
});
