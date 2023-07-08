import {readFile} from 'fs-extra';
import {getUserCss} from '../user-css';

jest.mock('fs-extra');

describe('getUserCss', () => {
	const readFileMock = readFile as jest.Mock;

	it("returns the contents of user.css in the user's Twine directory", async () => {
		readFileMock.mockReturnValue('mock-css');

		expect(await getUserCss()).toBe('mock-css');
		expect(readFileMock.mock.calls).toEqual([
			[
				'mock-electron-app-path-documents/common.appName/electron.userCss.filename',
				'utf8'
			]
		]);
	});

	it('returns undefined and  if the file could not be read', async () => {
		const warnSpy = jest
			.spyOn(global.console, 'warn')
			.mockImplementation(() => {});

		readFileMock.mockImplementation(() => Promise.reject(new Error()));

		expect(await getUserCss()).toBeUndefined();
		expect(warnSpy).toBeCalledTimes(1);
	});
});
