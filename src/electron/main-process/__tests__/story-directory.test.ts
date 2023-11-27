import {app, dialog, shell} from 'electron';
import {copy, mkdirp, readdir, remove, stat} from 'fs-extra';
import {getAppPref, setAppPref} from '../app-prefs';
import {showRelaunchDialog} from '../relaunch-dialog';
import {
	backupStoryDirectory,
	createStoryDirectory,
	revealStoryDirectory,
	getStoryDirectoryPath,
	initStoryDirectory,
	chooseStoryDirectoryPath
} from '../story-directory';

jest.mock('electron');
jest.mock('fs-extra');
jest.mock('../app-prefs');
jest.mock('../relaunch-dialog');

const getAppPrefMock = getAppPref as jest.Mock;

beforeEach(() => {
	getAppPrefMock.mockImplementation((name: string) => {
		if (['backupFolderPath', 'storyLibraryFolderPath'].includes(name)) {
			return undefined;
		}

		throw new Error(`Asked for unmocked pref ${name}`);
	});
});

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
				case 'test-app-pref-backup-directory/mock-backup-1':
					return {mtimeMs: 1000};
				case 'mock-electron-app-path-documents/common.appName/electron.backupsDirectoryName/mock-backup-2':
				case 'test-app-pref-backup-directory/mock-backup-2':
					return {mtimeMs: 500};
				default:
					throw new Error(`Asked to stat unmocked file: ${name}`);
			}
		});
		jest.spyOn(console, 'log').mockReturnValue();
		initStoryDirectory();
	});

	describe.each([
		[
			"isn't set",
			undefined,
			'mock-electron-app-path-documents/common.appName/electron.backupsDirectoryName'
		],
		[
			'is set',
			'test-app-pref-backup-directory',
			'test-app-pref-backup-directory'
		]
	])('When the backupFolderPath app pref %s', (_, appPref, path) => {
		beforeEach(() => {
			getAppPrefMock.mockImplementation((name: string) => {
				if (name === 'backupFolderPath') {
					return appPref;
				}

				throw new Error(`Asked for unmocked pref ${name}`);
			});
		});

		it(`copies the story directory to ${path}`, async () => {
			await backupStoryDirectory();
			expect(copyMock.mock.calls).toEqual([
				[
					'mock-electron-app-path-documents/common.appName/electron.storiesDirectoryName',
					expect.stringMatching(new RegExp(`${path}/.+`))
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
			expect(removeMock.mock.calls).toEqual([[`${path}/mock-backup-2`]]);
			removeMock.mockReset();
			await backupStoryDirectory(0);
			expect(removeMock.mock.calls).toEqual([
				[`${path}/mock-backup-2`],
				[`${path}/mock-backup-1`]
			]);
		});

		it('does not prune any backups if the number of backups is below or at the limit', async () => {
			await backupStoryDirectory(3);
			expect(removeMock).not.toHaveBeenCalled();
			await backupStoryDirectory(2);
			expect(removeMock).not.toHaveBeenCalled();
		});
	});
});

describe('chooseStoryDirectory()', () => {
	const setAppPrefMock = setAppPref as jest.Mock;
	const showRelaunchDialogMock = showRelaunchDialog as jest.Mock;
	const showOpenDialogMock = dialog.showOpenDialog as jest.Mock;

	beforeEach(() => {
		jest.spyOn(console, 'log').mockReturnValue();
		initStoryDirectory();
		showOpenDialogMock.mockResolvedValue({canceled: true});
	});

	it('opens a directory picker dialog', async () => {
		await chooseStoryDirectoryPath();
		expect(showOpenDialogMock.mock.calls).toEqual([
			[
				{
					defaultPath: getStoryDirectoryPath(),
					properties: ['createDirectory', 'openDirectory'],
					title: 'Choose a folder'
				}
			]
		]);
	});

	it('does nothing if the user cancels out of the dialog', async () => {
		await chooseStoryDirectoryPath();
		expect(setAppPrefMock).not.toBeCalled();
		expect(showRelaunchDialogMock).not.toBeCalled();
	});

	describe('If the user chooses a directory', () => {
		beforeEach(() =>
			showOpenDialogMock.mockResolvedValue({
				canceled: false,
				filePaths: ['mock-new-path']
			})
		);

		it('updates the app pref', async () => {
			await chooseStoryDirectoryPath();
			expect(setAppPrefMock.mock.calls).toEqual([
				['storyLibraryFolderPath', 'mock-new-path']
			]);
		});

		it('shows the relaunch dialog', async () => {
			await chooseStoryDirectoryPath();
			expect(showRelaunchDialogMock).toBeCalledTimes(1);
		});
	});
});

describe('createStoryDirectory()', () => {
	const mkdirpMock = mkdirp as jest.Mock;

	beforeEach(() => {
		jest.spyOn(console, 'log').mockReturnValue();
		initStoryDirectory();
	});

	it('resolves after calling mkdirp() on the story directory path', async () => {
		await createStoryDirectory();
		expect(mkdirpMock.mock.calls).toEqual([[getStoryDirectoryPath()]]);
	});

	it('rejects if mkdirp() rejects', async () => {
		const error = new Error();

		mkdirpMock.mockRejectedValue(error);
		await expect(createStoryDirectory).rejects.toBe(error);
	});
});

describe('initStoryDirectoryPath()', () => {
	const mkdirpMock = mkdirp as jest.Mock;
	const readdirMock = readdir as jest.Mock;

	beforeEach(() => jest.spyOn(console, 'log').mockReturnValue());

	it('returns the default path if no app pref is set', async () => {
		await initStoryDirectory();
		expect(getStoryDirectoryPath()).toBe(
			'mock-electron-app-path-documents/common.appName/electron.storiesDirectoryName'
		);
	});

	describe('When an app pref is set', () => {
		beforeEach(() => {
			getAppPrefMock.mockImplementation((name: string) => {
				if (name === 'storyLibraryFolderPath') {
					return 'mock-story-library-folder-app-pref';
				}

				throw new Error(`Asked for unmocked pref ${name}`);
			});
		});

		it('returns the app pref path if it is readable', async () => {
			readdirMock.mockReturnValue(undefined);
			await initStoryDirectory();
			expect(getStoryDirectoryPath()).toBe(
				'mock-story-library-folder-app-pref'
			);
		});

		it("returns the app pref path if it isn't readable, but can be created", async () => {
			// First attempt is the initial one; second is after the mkdirp call.

			readdirMock.mockImplementationOnce(() => {
				throw new Error();
			});
			await initStoryDirectory();
			expect(getStoryDirectoryPath()).toBe(
				'mock-story-library-folder-app-pref'
			);
			expect(mkdirpMock).toBeCalledTimes(1);
		});

		describe("When the app pref isn't readable nor can be created", () => {
			const quitMock = app.quit as jest.Mock;
			const showMessageBoxMock = dialog.showMessageBox as jest.Mock;

			beforeEach(() => {
				readdirMock.mockImplementation(() => {
					throw new Error();
				});
				showMessageBoxMock.mockResolvedValue({response: 0});
			});

			it('shows a dialog to the user', async () => {
				await initStoryDirectory();
				expect(showMessageBoxMock.mock.calls).toEqual([
					[
						expect.objectContaining({
							message: 'electron.errors.storyLibraryFolderAppPref.message',
							type: 'error',
							buttons: [
								'electron.errors.storyLibraryFolderAppPref.useDefault',
								'electron.errors.storyLibraryFolderAppPref.quit'
							],
							defaultId: 0
						})
					]
				]);
			});

			it('quits if the user chooses that option', async () => {
				showMessageBoxMock.mockResolvedValue({response: 1});
				await initStoryDirectory();
				expect(quitMock).toBeCalledTimes(1);
			});

			it('continues and returns the default path if the user chooses that option', async () => {
				showMessageBoxMock.mockResolvedValue({response: 0});
				await initStoryDirectory();
				expect(getStoryDirectoryPath()).toBe(
					'mock-electron-app-path-documents/common.appName/electron.storiesDirectoryName'
				);
				expect(quitMock).not.toBeCalled();
			});
		});
	});
});

describe('revealStoryDirectoryPath()', () => {
	let openPathSpy: jest.SpyInstance;

	beforeEach(() => {
		openPathSpy = jest.spyOn(shell, 'openPath');
		jest.spyOn(console, 'log').mockReturnValue();
		initStoryDirectory();
	});

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
