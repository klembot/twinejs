import {loadJsonFile, saveJsonFile} from '../json-file';
import {readJson, writeJson} from 'fs-extra';

jest.mock('fs-extra');

describe('loadJsonFile()', () => {
	const readJsonMock = readJson as jest.Mock;

	it("resolves to the contents of a JSON file in the app's user data path", async () => {
		const mockData = {test: true};

		readJsonMock.mockResolvedValue(mockData);
		expect(await loadJsonFile('test.json')).toBe(mockData);
		expect(readJsonMock.mock.calls).toEqual([
			['mock-electron-app-path-userData/test.json']
		]);
	});

	it('rejects if there is an error reading the file', async () => {
		const mockError = new Error();

		readJsonMock.mockRejectedValue(mockError);
		await expect(loadJsonFile('test.json')).rejects.toBe(mockError);
	});
});

describe('saveJsonFile()', () => {
	const writeJsonMock = writeJson as jest.Mock;

	it("resolves after writing data to the app's user data path", async () => {
		const mockData = {test: true};

		await saveJsonFile('test.json', mockData);
		expect(writeJsonMock.mock.calls).toEqual([
			['mock-electron-app-path-userData/test.json', mockData]
		]);
	});

	it('rejects if there is an error writing data', async () => {
		const mockError = new Error();

		writeJsonMock.mockRejectedValue(mockError);
		await expect(saveJsonFile('test.json', {})).rejects.toBe(mockError);
	});
});
