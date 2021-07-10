import {clear, mockUserAgent} from 'jest-useragent-mock';
import {isElectronMain, isElectronRenderer} from '../is-electron';

// Grabbed one from https://user-agents.net/applications/electron.

const electronUserAgent =
	'Mozilla/5.0 (Windows NT 10; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.128 Electron/4.1.1 Safari/537.36';

const nonElectronUserAgent =
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:70.0) Gecko/20100101 Firefox/70.0';

describe('isElectronRenderer', () => {
	afterAll(clear);

	it('sniffs Electron context using user agent', () => {
		mockUserAgent(electronUserAgent);
		expect(isElectronRenderer()).toBe(true);
		mockUserAgent(nonElectronUserAgent);
		expect(isElectronRenderer()).toBe(false);
	});
});

describe('isElectronMain', () => {
	let prevElectronVersion = process.versions.electron;

	afterAll(() => ((process.versions.electron as any) = prevElectronVersion));

	it('sniffs Electron main context using process.versions', () => {
		(process.versions.electron as any) = '1.2.3';
		expect(isElectronMain()).toBe(true);
		delete (process.versions as any).electron;
		expect(isElectronMain()).toBe(false);
	});
});
