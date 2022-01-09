import {app, dialog, shell} from 'electron';
import {
	mkdtemp,
	move,
	readdir,
	readFile,
	rename,
	stat,
	writeFile
} from 'fs-extra';
import {
	deleteStory,
	loadStories,
	renameStory,
	saveStoryHtml
} from '../story-file';
import {
	fileWasTouched,
	stopTrackingFile,
	wasFileChangedExternally
} from '../track-file-changes';
import {fakeStory} from '../../../test-util';
import {Story} from '../../../store/stories';
import {storyFileName} from '../../shared/story-filename';

jest.mock('../track-file-changes');

// See https://github.com/facebook/jest/issues/2157
// This won't work in every case, so not putting it in test-utils.

function resolveAllPromises() {
	return new Promise(resolve => setImmediate(resolve));
}

describe('deleteStory', () => {
	const stopTrackingFileMock = stopTrackingFile as jest.Mock;
	const trashItemMock = shell.trashItem as jest.Mock;
	let story: Story;

	beforeEach(() => {
		jest.spyOn(console, 'log').mockReturnValue();
		jest.spyOn(console, 'warn').mockReturnValue();
		story = fakeStory();
	});

	it('moves the story to the trash', async () => {
		await deleteStory(story);
		expect(trashItemMock.mock.calls).toEqual([
			[
				`mock-electron-app-path-documents/common.appName/electron.storiesDirectoryName/${storyFileName(
					story
				)}`
			]
		]);
	});

	it('stops tracking the file for changes', async () => {
		await deleteStory(story);
		expect(stopTrackingFileMock.mock.calls).toEqual([
			[
				`mock-electron-app-path-documents/common.appName/electron.storiesDirectoryName/${storyFileName(
					story
				)}`
			]
		]);
	});

	it('rejects with an error if trashing the item fails', async () => {
		const mockError = new Error();

		trashItemMock.mockRejectedValue(mockError);
		await expect(deleteStory(story)).rejects.toBe(mockError);
	});

	it('does not resolve until all async file operations have completed', async () => {
		let resolveTrashItem = () => {};
		let done = jest.fn();

		trashItemMock.mockReturnValue(
			new Promise<void>(
				resolve => (resolveTrashItem = resolve)
			)
		);

		deleteStory(story).then(done);
		await resolveAllPromises();
		expect(done).not.toBeCalled();
		resolveTrashItem();
		await resolveAllPromises();
		expect(done).toBeCalledTimes(1);
	});
});

describe('loadStories', () => {
	const fileWasTouchedMock = fileWasTouched as jest.Mock;
	const readdirMock = readdir as jest.Mock;
	const readFileMock = readFile as jest.Mock;
	const statMock = stat as jest.Mock;

	beforeEach(() => {
		readdirMock.mockResolvedValue(['test-story-1.html', 'test-story-2.html']);
		readFileMock.mockImplementation((name: string) => {
			switch (name) {
				case 'mock-electron-app-path-documents/common.appName/electron.storiesDirectoryName/test-story-1.html':
					return Promise.resolve('mock story 1 contents');

				case 'mock-electron-app-path-documents/common.appName/electron.storiesDirectoryName/test-story-2.html':
					return Promise.resolve('mock story 2 contents');

				default:
					throw new Error(`Asked to stat a non-mocked file: ${name}`);
			}
		});
		statMock.mockImplementation((name: string) => {
			switch (name) {
				case 'mock-electron-app-path-documents/common.appName/electron.storiesDirectoryName/test-story-1.html':
					return Promise.resolve({
						isDirectory: () => false,
						mtime: new Date('1/1/1990')
					});

				case 'mock-electron-app-path-documents/common.appName/electron.storiesDirectoryName/test-story-2.html':
					return Promise.resolve({
						isDirectory: () => false,
						mtime: new Date('1/1/2000')
					});

				default:
					throw new Error(`Asked to stat a non-mocked file: ${name}`);
			}
		});
	});

	it('resolves to an array of stories in the story library directory', async () => {
		const result = await loadStories();

		expect(result).toEqual([
			{
				htmlSource: 'mock story 1 contents',
				mtime: expect.any(Date)
			},
			{
				htmlSource: 'mock story 2 contents',
				mtime: expect.any(Date)
			}
		]);
		expect(result[0].mtime.getTime()).toBe(new Date('1/1/1990').getTime());
		expect(result[1].mtime.getTime()).toBe(new Date('1/1/2000').getTime());
	});

	it("ignores files that don't have a .html suffix", async () => {
		readdirMock.mockResolvedValue([
			'test-story-1.html',
			'test-story-2.html',
			'bad.txt'
		]);

		expect(await loadStories()).toEqual([
			{
				htmlSource: 'mock story 1 contents',
				mtime: expect.any(Date)
			},
			{
				htmlSource: 'mock story 2 contents',
				mtime: expect.any(Date)
			}
		]);
	});

	it('ignores directories', async () => {
		statMock.mockImplementation((name: string) => {
			switch (name) {
				case 'mock-electron-app-path-documents/common.appName/electron.storiesDirectoryName/test-story-1.html':
					return Promise.resolve({
						isDirectory: () => false,
						mtime: new Date('1/1/1990')
					});

				case 'mock-electron-app-path-documents/common.appName/electron.storiesDirectoryName/test-story-2.html':
					return Promise.resolve({
						isDirectory: () => true,
						mtime: new Date('1/1/2000')
					});

				default:
					throw new Error(`Asked to stat a non-mocked file: ${name}`);
			}
		});

		expect(await loadStories()).toEqual([
			{
				htmlSource: 'mock story 1 contents',
				mtime: expect.any(Date)
			}
		]);
	});

	it('begins tracking all story files', async () => {
		await loadStories();
		expect(fileWasTouchedMock.mock.calls).toEqual([
			[
				'mock-electron-app-path-documents/common.appName/electron.storiesDirectoryName/test-story-1.html'
			],
			[
				'mock-electron-app-path-documents/common.appName/electron.storiesDirectoryName/test-story-2.html'
			]
		]);
	});

	it("doesn't track non-story files", async () => {
		readdirMock.mockResolvedValue([
			'test-story-1.html',
			'test-story-2.html',
			'bad.txt'
		]);
		await loadStories();
		expect(fileWasTouchedMock.mock.calls).toEqual([
			[
				'mock-electron-app-path-documents/common.appName/electron.storiesDirectoryName/test-story-1.html'
			],
			[
				'mock-electron-app-path-documents/common.appName/electron.storiesDirectoryName/test-story-2.html'
			]
		]);
	});

	it('rejects if loading any file fails', async () => {
		const mockError = new Error();

		readFileMock.mockImplementation((name: string) => {
			switch (name) {
				case 'mock-electron-app-path-documents/common.appName/electron.storiesDirectoryName/test-story-1.html':
					return Promise.resolve('mock story 1 contents');

				case 'mock-electron-app-path-documents/common.appName/electron.storiesDirectoryName/test-story-2.html':
					return Promise.reject(mockError);

				default:
					throw new Error(`Asked to stat a non-mocked file: ${name}`);
			}
		});

		await expect(loadStories()).rejects.toBe(mockError);
	});

	it('does not resolve until all async file operations have finished', async () => {
		let resolveReaddir = () => {};
		let resolveStat = () => {};
		let resolveFileWasTouched = () => {};
		let done = jest.fn();

		readdirMock.mockReturnValue(
			new Promise<string[]>(
				resolve => (resolveReaddir = () => resolve(['test-story-1.html']))
			)
		);
		statMock.mockReturnValue(
			new Promise<any>(
				resolve =>
					(resolveStat = () =>
						resolve({isDirectory: () => false, mtime: new Date('1/1/2000')}))
			)
		);
		fileWasTouchedMock.mockReturnValue(
			new Promise<void>(resolve => (resolveFileWasTouched = resolve))
		);

		loadStories().then(done);
		await resolveAllPromises();
		expect(done).not.toBeCalled();
		resolveReaddir();
		await resolveAllPromises();
		expect(done).not.toBeCalled();
		resolveStat();
		await resolveAllPromises();
		expect(done).not.toBeCalled();
		resolveFileWasTouched();
		await resolveAllPromises();
		expect(done).toBeCalledTimes(1);
	});
});

describe('renameStory', () => {
	let oldFileName: string;
	let newFileName: string;
	let oldStory: Story;
	let newStory: Story;
	const fileWasTouchedMock = fileWasTouched as jest.Mock;
	const stopTrackingFileMock = stopTrackingFile as jest.Mock;
	const renameMock = rename as jest.Mock;

	beforeEach(() => {
		jest.spyOn(console, 'log').mockReturnValue();
		jest.spyOn(console, 'warn').mockReturnValue();
		oldStory = fakeStory();
		oldFileName = storyFileName(oldStory);
		newStory = {...oldStory, name: 'mock-new-name'};
		newFileName = storyFileName(newStory);
	});

	it('renames the file on disk', async () => {
		await renameStory(oldStory, newStory);
		expect(renameMock.mock.calls).toEqual([
			[
				`mock-electron-app-path-documents/common.appName/electron.storiesDirectoryName/${oldFileName}`,
				`mock-electron-app-path-documents/common.appName/electron.storiesDirectoryName/${newFileName}`
			]
		]);
	});

	it('stops tracking the old filename', async () => {
		await renameStory(oldStory, newStory);
		expect(stopTrackingFileMock.mock.calls).toEqual([
			[
				`mock-electron-app-path-documents/common.appName/electron.storiesDirectoryName/${oldFileName}`
			]
		]);
	});

	it('tracks the new filename', async () => {
		await renameStory(oldStory, newStory);
		expect(fileWasTouchedMock.mock.calls).toEqual([
			[
				`mock-electron-app-path-documents/common.appName/electron.storiesDirectoryName/${newFileName}`
			]
		]);
	});

	it('rejects if renaming the file fails', async () => {
		const mockError = new Error();

		renameMock.mockRejectedValue(mockError);
		await expect(renameStory(oldStory, newStory)).rejects.toBe(mockError);
	});

	it('does not resolve until all async file operations have finished', async () => {
		let resolveRename = () => {};
		let resolveFileWasTouched = () => {};
		let done = jest.fn();

		renameMock.mockReturnValue(
			new Promise<void>(resolve => (resolveRename = resolve))
		);
		fileWasTouchedMock.mockReturnValue(
			new Promise<void>(resolve => (resolveFileWasTouched = resolve))
		);

		renameStory(oldStory, newStory).then(done);
		await resolveAllPromises();
		expect(done).not.toBeCalled();
		resolveRename();
		await resolveAllPromises();
		expect(done).not.toBeCalled();
		resolveFileWasTouched();
		await resolveAllPromises();
		expect(done).toBeCalledTimes(1);
	});
});

describe('saveStoryHtml()', () => {
	const fileWasTouchedMock = fileWasTouched as jest.Mock;
	const mkdtempMock = mkdtemp as jest.Mock;
	const moveMock = move as jest.Mock;
	const quitMock = app.quit as jest.Mock;
	const relaunchMock = app.relaunch as jest.Mock;
	const showMessageBoxMock = dialog.showMessageBox as jest.Mock;
	const wasFileChangedExternallyMock = wasFileChangedExternally as jest.Mock;
	const writeFileMock = writeFile as jest.Mock;
	let story: Story;

	beforeEach(() => {
		jest.spyOn(console, 'log').mockReturnValue();
		jest.spyOn(console, 'error').mockReturnValue();
		mkdtempMock.mockImplementation(
			async (prefix: string) => `mkdtemp-mock-${prefix}`
		);
		story = fakeStory();
	});

	it('saves the HTML to a temp file, then replaces the destination with the temp file', async () => {
		await saveStoryHtml(story, 'story html');
		expect(writeFileMock.mock.calls).toEqual([
			[
				`mkdtemp-mock-mock-electron-app-path-temp/twine-${
					story.id
				}/${storyFileName(story)}`,
				'story html',
				'utf8'
			]
		]);
		expect(moveMock.mock.calls).toEqual([
			[
				`mkdtemp-mock-mock-electron-app-path-temp/twine-${
					story.id
				}/${storyFileName(story)}`,
				`mock-electron-app-path-documents/common.appName/electron.storiesDirectoryName/${storyFileName(
					story
				)}`,
				{overwrite: true}
			]
		]);
	});

	it('tracks that the destination file has changed', async () => {
		await saveStoryHtml(story, 'story html');
		expect(fileWasTouchedMock.mock.calls).toEqual([
			[
				`mock-electron-app-path-documents/common.appName/electron.storiesDirectoryName/${storyFileName(
					story
				)}`
			]
		]);
	});

	it('does not resolve until all async file operations have finished', async () => {
		let resolveMkdtemp = () => {};
		let resolveWriteFile = () => {};
		let resolveMove = () => {};
		let resolveFileWasTouched = () => {};
		let done = jest.fn();

		mkdtempMock.mockReturnValue(
			new Promise(resolve => (resolveMkdtemp = () => resolve('mock-temp-dir')))
		);
		writeFileMock.mockReturnValue(
			new Promise<void>(resolve => (resolveWriteFile = resolve))
		);
		moveMock.mockReturnValue(
			new Promise<void>(resolve => (resolveMove = resolve))
		);
		fileWasTouchedMock.mockReturnValue(
			new Promise<void>(resolve => (resolveFileWasTouched = resolve))
		);

		saveStoryHtml(story, 'story html').then(done);
		await resolveAllPromises();
		expect(done).not.toBeCalled();
		resolveMkdtemp();
		await resolveAllPromises();
		expect(done).not.toBeCalled();
		resolveWriteFile();
		await resolveAllPromises();
		expect(done).not.toBeCalled();
		resolveMove();
		await resolveAllPromises();
		expect(done).not.toBeCalled();
		resolveFileWasTouched();
		await resolveAllPromises();
		expect(done).toBeCalledTimes(1);
	});

	it("doesn't show a dialog", async () => {
		await saveStoryHtml(story, 'story html');
		expect(showMessageBoxMock).not.toHaveBeenCalled();
	});

	it('rejects if saving the HTML fails', async () => {
		const mockError = new Error();

		writeFileMock.mockRejectedValue(mockError);
		await expect(saveStoryHtml(story, 'story html')).rejects.toBe(mockError);
		expect(moveMock).not.toBeCalled();
	});

	it('rejects if replacing the destination file fails', async () => {
		const mockError = new Error();

		moveMock.mockRejectedValue(mockError);
		await expect(saveStoryHtml(story, 'story html')).rejects.toBe(mockError);
	});

	describe('if the destination file has been changed externally', () => {
		beforeEach(() => {
			wasFileChangedExternallyMock.mockResolvedValue(true);
			showMessageBoxMock.mockResolvedValue({response: 0});
		});

		it('asks the user what to do', async () => {
			await saveStoryHtml(story, 'story html');
			expect(showMessageBoxMock).toHaveBeenCalled();
		});

		it('relaunches if the user chooses that option', async () => {
			showMessageBoxMock.mockResolvedValue({response: 1});
			await saveStoryHtml(story, 'story html');
			expect(relaunchMock).toHaveBeenCalled();
			expect(quitMock).toHaveBeenCalled();
			expect(writeFileMock).not.toHaveBeenCalled();
		});

		it('overwrites the destination if the user chooses that option', async () => {
			showMessageBoxMock.mockResolvedValue({response: 0});
			await saveStoryHtml(story, 'story html');
			expect(relaunchMock).not.toHaveBeenCalled();
			expect(quitMock).not.toHaveBeenCalled();
			expect(writeFileMock).toHaveBeenCalled();
		});
	});
});
