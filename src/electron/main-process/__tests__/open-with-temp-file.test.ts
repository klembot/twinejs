import {openWithTempFile} from '../open-with-temp-file';
import {shell} from 'electron';
import {writeFile} from 'fs-extra';

jest.mock('electron');
jest.mock('fs-extra');

describe('openWithTempFile', () => {
	const writeFileMock = writeFile as jest.Mock;
	const openMock = shell.openPath as jest.Mock;

	it('writes data to a temp file in the Electron temp directory', () => {
		openWithTempFile('test data', '.txt');
		expect(writeFileMock).toBeCalledTimes(1);
		expect(writeFileMock.mock.calls[0]).toEqual([
			expect.stringMatching(/^mock-electron-app-path-temp\/.*\.txt$/),
			'test data'
		]);
	});

	it('opens the file once written to', async () => {
		openWithTempFile('test data', '.txt');
		await Promise.resolve();
		expect(openMock).toBeCalledTimes(1);
		expect(openMock.mock.calls[0]).toEqual([writeFileMock.mock.calls[0][0]]);
	});
});
