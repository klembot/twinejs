import {stat} from 'fs-extra';
import {
	fileWasTouched,
	stopTrackingFile,
	wasFileChangedExternally
} from '../track-file-changes';

jest.mock('fs-extra');

describe('wasFileChangedExternally()', () => {
	const statMock = stat as jest.Mock;
	const mtimes: Record<string, number> = {};

	beforeEach(() => {
		mtimes['test-file'] = 1000;
		statMock.mockImplementation(name => ({mtimeMs: mtimes[name]}));
	});

	afterEach(() => {
		stopTrackingFile('test-file');
	});

	it('resolves to false if the file has not had fileWasTouched() called on it', async () => {
		expect(await wasFileChangedExternally('test-file')).toBe(false);
	});

	it("resolves to false if the file's mtime has not changed since fileWasTouched() was called on it", async () => {
		await fileWasTouched('test-file');
		expect(await wasFileChangedExternally('test-file')).toBe(false);
	});

	it("resolves to true if the file's mtime has changed since fileWasTouched() was called on it", async () => {
		mtimes['test-file'] = 1000;
		await fileWasTouched('test-file');
		mtimes['test-file'] = 2000;
		expect(await wasFileChangedExternally('test-file')).toBe(true);
		mtimes['test-file'] = 500;
		expect(await wasFileChangedExternally('test-file')).toBe(true);
	});

	it('returns false if the file has had stopTrackingFile() called on it', async () => {
		await fileWasTouched('test-file');
		mtimes['test-file'] = 2000;
		stopTrackingFile('test-file');
		expect(await wasFileChangedExternally('test-file')).toBe(false);
	});

	it('rejects if statting the file fails', async () => {
		const mockError = new Error();

		await fileWasTouched('test-file');
		statMock.mockRejectedValue(mockError);
		await expect(wasFileChangedExternally('test-file')).rejects.toBe(mockError);
	});

	it('tracks files separately', async () => {
		statMock.mockImplementation((name: string) => {});
	});
});
