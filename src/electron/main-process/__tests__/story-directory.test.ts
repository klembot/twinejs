import {shell} from 'electron';
import {copy, mkdirp, readdir, remove, stat} from 'fs-extra';
import {
	backupStoryDirectory,
	createStoryDirectory,
	revealStoryDirectory,
	storyDirectoryPath
} from '../story-directory';

jest.mock('electron');
jest.mock('fs-extra');

describe('backupStoryDirectory()', () => {
	const copyMock = copy as jest.Mock;
	const readdirMock = readdir as jest.Mock;
	const removeMock = remove as jest.Mock;
	const statMock = stat as jest.Mock;

	beforeEach(() => {
		readdirMock.mockResolvedValue([
			{isDirectory: () => true, name: 'mock-backup-1'},
			{isDirectory: () => true, name: 'mock-backup-2'}
		]);
		statMock.mockImplementation((name: string) => {
			switch (name) {
				case 'mock-electron-app-path-documents/common.appName/electron.backupsDirectoryName/mock-backup-1':
					return {mtimeMs: 1000};
				case 'mock-electron-app-path-documents/common.appName/electron.backupsDirectoryName/mock-backup-2':
					return {mtimeMs: 500};
				default:
					throw new Error(`Asked to stat unmocked file: ${name}`);
			}
		});
		jest.spyOn(console, 'log').mockReturnValue();
	});

	it('copies the story directory to the backups directory', async () => {
		await backupStoryDirectory();
		expect(copyMock.mock.calls).toEqual([
			[
				'mock-electron-app-path-documents/common.appName/electron.storiesDirectoryName',
				expect.stringMatching(
					/mock-electron-app-path-documents\/common.appName\/electron.backupsDirectoryName\/.+/
				)
			]
		]);
	});

	it('uses unique names for backup directories', async () => {
		await backupStoryDirectory();
		await new Promise(resolve => window.setTimeout(resolve, 5));
		await backupStoryDirectory();
		expect(copyMock.mock.calls[0][1]).not.toBe(copyMock.mock.calls[1][1]);
	});

	it('prunes the oldest backups if the number of backups is above the limit', async () => {
		await backupStoryDirectory(1);
		expect(removeMock.mock.calls).toEqual([
			[
				'mock-electron-app-path-documents/common.appName/electron.backupsDirectoryName/mock-backup-2'
			]
		]);
		removeMock.mockReset();
		await backupStoryDirectory(0);
		expect(removeMock.mock.calls).toEqual([
			[
				'mock-electron-app-path-documents/common.appName/electron.backupsDirectoryName/mock-backup-2'
			],
			[
				'mock-electron-app-path-documents/common.appName/electron.backupsDirectoryName/mock-backup-1'
			]
		]);
	});

	it('does not prune any backups if the number of backups is below or at the limit', async () => {
		await backupStoryDirectory(3);
		expect(removeMock).not.toHaveBeenCalled();
		await backupStoryDirectory(2);
		expect(removeMock).not.toHaveBeenCalled();
	});
});

describe('createStoryDirectory()', () => {
	const mkdirpMock = mkdirp as jest.Mock;

	it('resolves after calling mkdirp() on the story directory path', async () => {
		await createStoryDirectory();
		expect(mkdirpMock.mock.calls).toEqual([[storyDirectoryPath()]]);
	});

	it('rejects if mkdirp() rejects', async () => {
		const error = new Error();

		mkdirpMock.mockRejectedValue(error);
		await expect(createStoryDirectory).rejects.toBe(error);
	});
});

describe('storyDirectoryPath()', () => {
	it("returns the user's story directory", () =>
		expect(storyDirectoryPath()).toBe(
			'mock-electron-app-path-documents/common.appName/electron.storiesDirectoryName'
		));
});

describe('revealStoryDirectoryPath()', () => {
	let openPathSpy: jest.SpyInstance;

	beforeEach(() => (openPathSpy = jest.spyOn(shell, 'openPath')));

	it('resolves after showing the story directory', async () => {
		await revealStoryDirectory();
		expect(openPathSpy.mock.calls).toEqual([
			[
				'mock-electron-app-path-documents/common.appName/electron.storiesDirectoryName'
			]
		]);
	});

	it('rejects with an error if showing the story directory fails', async () => {
		const error = new Error();

		openPathSpy.mockRejectedValue(error);
		await expect(revealStoryDirectory).rejects.toBe(error);
	});
});
