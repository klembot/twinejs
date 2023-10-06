import minimist from 'minimist';
import {getAppPref, loadAppPrefs, setAppPref} from '../app-prefs';
import {loadJsonFileSync, saveJsonFile} from '../json-file';

jest.mock('minimist');
jest.mock('../json-file');

beforeEach(() => {
	jest.spyOn(console, 'log').mockReturnValue();
	jest.spyOn(console, 'warn').mockReturnValue();
});

const loadJsonFileSyncMock = loadJsonFileSync as jest.Mock;
const saveJsonFileMock = saveJsonFile as jest.Mock;
const minimistMock = minimist as jest.Mock;

function mockJsonFile(value: any) {
	loadJsonFileSyncMock.mockImplementation((name: string) => {
		if (name === 'app-prefs.json') {
			return value;
		}

		throw new Error(`Loaded incorrect file "${name}"`);
	});
}

describe('loadAppPrefs and getAppPrefs', () => {
	beforeEach(() => {
		mockJsonFile({});
		minimistMock.mockReturnValue({});
	});

	it('loads prefs from command line arguments', () => {
		minimistMock.mockReturnValue({
			scratchFolderPath: 'mock-scratch-folder-path'
		});
		loadAppPrefs();
		expect(getAppPref('scratchFolderPath')).toBe('mock-scratch-folder-path');
	});

	it('loads prefs from the app prefs file', () => {
		mockJsonFile({scratchFolderPath: 'mock-scratch-folder-path'});
		loadAppPrefs();
		expect(getAppPref('scratchFolderPath')).toBe('mock-scratch-folder-path');
	});

	it('prefers command line arguments to values set in the app prefs file', () => {
		mockJsonFile({scratchFolderPath: 'json-path'});
		minimistMock.mockReturnValue({
			scratchFolderPath: 'args-path'
		});
		loadAppPrefs();
		expect(getAppPref('scratchFolderPath')).toBe('args-path');
	});

	it("ignores values in the app prefs file that aren't known prefs", () => {
		mockJsonFile({anUnrecognizedKey: 'fail'});
		loadAppPrefs();
		expect(getAppPref('anUnrecognizedKey' as any)).toBeUndefined();
	});

	it("ignores values in command line arguments that aren't known prefs", () => {
		minimistMock.mockReturnValue({anUnrecognizedKey: 'fail'});
		loadAppPrefs();
		expect(getAppPref('anUnrecognizedKey' as any)).toBeUndefined();
	});

	it("doesn't throw an error if the app prefs file couldn't be loaded", () => {
		minimistMock.mockReturnValue({
			scratchFolderPath: 'mock-scratch-folder-path'
		});
		loadJsonFileSyncMock.mockImplementation(() => {
			throw new Error();
		});
		loadAppPrefs();
		expect(getAppPref('scratchFolderPath')).toBe('mock-scratch-folder-path');
	});
});

describe('getAppPref', () => {
	// Because this is stored in the module itself, unclear how to test this.
	it.todo('throws an error if it was called before prefs were loaded');
});

describe('setAppPref', () => {
	beforeEach(() => {
		mockJsonFile({});
		minimistMock.mockReturnValue({scratchFolderPath: 'pre-existing'});
	});

	it('resolves after setting a pref', async () => {
		loadAppPrefs();
		await setAppPref('scratchFolderPath', 'mock-change');
		expect(getAppPref('scratchFolderPath')).toBe('mock-change');
	});

	it('resolves after saving changes to the app prefs file', async () => {
		loadAppPrefs();
		expect(saveJsonFileMock).not.toBeCalled();
		await setAppPref('scratchFolderPath', 'mock-change');
		expect(saveJsonFileMock.mock.calls).toEqual([
			['app-prefs.json', {scratchFolderPath: 'mock-change'}]
		]);
	});

	it('rejects if saving changes fails', async () => {
		saveJsonFileMock.mockRejectedValue(new Error());
		loadAppPrefs();
		await expect(() =>
			setAppPref('scratchFolderPath', 'mock-value')
		).rejects.toBeInstanceOf(Error);
	});

	// Because this is stored in the module itself, unclear how to test this.
	it.todo('rejects if it was called before prefs were loaded');
});
