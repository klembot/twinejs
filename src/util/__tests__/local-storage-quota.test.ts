import {
	localStorageFreeSpace,
	localStorageUsedSpace
} from '../local-storage-quota';

describe('localStorageUsedSpace()', () => {
	beforeEach(() => window.localStorage.clear());
	afterAll(() => window.localStorage.clear());

	it('returns the amount of space used by local storage in characters', () => {
		window.localStorage.setItem('test', 'abc');
		expect(localStorageUsedSpace()).toBe(14); // {"test":"abc"}
	});
});

describe('localStorageFreeSpace()', () => {
	// This relies on the default jsdom local storage quota--not clear how to set
	// it.
	//
	// See https://github.com/jsdom/jsdom/blob/master/README.md#simple-options

	it('returns the amount of space available in local storage in characters', async () =>
		expect(await localStorageFreeSpace(100000, 0)).toBe(4900000));
});
