import jsonp from 'jsonp';
import {fetchStoryFormatProperties} from '../fetch-properties';
import {isElectronRenderer} from '../../is-electron';
import {TwineElectronWindow} from '../../../electron/shared';

jest.mock('../../is-electron');
jest.mock('jsonp');

describe('fetchStoryFormatProperties', () => {
	beforeEach(() => {
		(isElectronRenderer as jest.Mock).mockReturnValue(false);
		(jsonp as jest.Mock).mockImplementation(
			(url: string, props: any, callback: any) => {
				if (url === '/mock-format-url' && props.name === 'storyFormat') {
					callback(null, {mockJsonpResponse: true});
				} else {
					throw new Error(`Incorrect JSONP call: "${url}"`);
				}
			}
		);
	});

	it('resolves to the result of a JSONP request, expecting storyFormat as callback', async () => {
		expect(await fetchStoryFormatProperties('mock-format-url')).toEqual({
			mockJsonpResponse: true
		});
	});

	it('rejects if there was an error with the request', async () => {
		const mockError = new Error();

		(jsonp as jest.Mock).mockImplementation(
			(url: string, props: any, callback: any) => {
				callback(mockError);
			}
		);

		await expect(fetchStoryFormatProperties('mock-format-url')).rejects.toThrow(
			mockError
		);
	});

	it('uses twineElectron.jsonp() in an Electron context', async () => {
		const electronWindow = window as TwineElectronWindow;

		(electronWindow.twineElectron as any) = {
			jsonp: jest.fn((url: string, props: any, callback?: any) => {
				callback(null, {});
				return () => {};
			})
		};
		await fetchStoryFormatProperties('mock-format-url');
		expect(electronWindow.twineElectron!.jsonp).not.toHaveBeenCalled();
		(isElectronRenderer as jest.Mock).mockReturnValue(true);
		await fetchStoryFormatProperties('mock-format-url');
		expect(electronWindow.twineElectron!.jsonp).toHaveBeenCalled();
	});

	fit('only makes one request at a time', async () => {
		let pending = true;
		const jsonpMock = jsonp as jest.Mock;

		jsonpMock.mockImplementationOnce(
			(url: string, props: any, callback: any) => {
				window.setTimeout(() => {
					pending = false;
					callback(null, {});
				}, 20);
			}
		);

		jsonpMock.mockImplementationOnce(
			(url: string, props: any, callback: any) => {
				if (pending) {
					throw new Error('Multiple simultaneous calls have occurred');
				}

				callback(null, {});
			}
		);

		// No await on the first call.

		fetchStoryFormatProperties('mock-format-url');
		await fetchStoryFormatProperties('mock-format-url');
		expect(jsonp).toHaveBeenCalledTimes(2);
	});
});
