import requestStoryFormat from '../request-story-format';
import isElectron from '../is-electron';
import jsonp from 'jsonp';

jest.mock('../is-electron');
jest.mock('jsonp');

describe('requestStoryFormat()', () => {
	beforeEach(() => {
		isElectron.mockReturnValue(false);
		jsonp.mockReset();
		jsonp.mockImplementation((url, props, callback) => {
			if (url === 'test-url' && props.name === 'storyFormat') {
				callback(null, {test: true});
			}
		});
	});

	it('resolves to the result of a JSONP request, expecting storyFormat as callback', async () => {
		const result = await requestStoryFormat('test-url');

		expect(result.test).toBe(true);
	});

	it('rejects if there was an error with the request', async () => {
		const error = new Error('Test');

		jsonp.mockImplementation((url, props, callback) => {
			if (url === 'test-url' && props.name === 'storyFormat') {
				callback(error);
			}
		});

		await expect(requestStoryFormat('test-url')).rejects.toThrow(error);
	});

	it('uses twineElectron.jsonp() in an Electron context', async () => {
		global.twineElectron = {
			jsonp: jest.fn((url, props, callback) => callback(null, {}))
		};
		await requestStoryFormat('test-url');
		expect(global.twineElectron.jsonp).not.toHaveBeenCalled();
		isElectron.mockReturnValue(true);
		await requestStoryFormat('test-url');
		expect(global.twineElectron.jsonp).toHaveBeenCalled();
	});

	it('only makes one request at a time', async () => {
		let pending = 0;

		jsonp.mockReset();
		jsonp.mockImplementation((url, props, callback) => {
			if (pending > 0) {
				throw new Error('Multiple simultaneous calls have occurred');
			}

			pending++;

			if (url === 'test-url' && props.name === 'storyFormat') {
				window.setTimeout(() => {
					pending--;
					callback(null, {pass: true});
				}, 20);
			}
		});

		requestStoryFormat('test-url');
		await requestStoryFormat('test-url');
		expect(jsonp).toHaveBeenCalledTimes(2);
	});
});
