import {app, dialog} from 'electron';
import {initApp} from '../init-app';
import {initIpc} from '../ipc';
import {initLocales} from '../locales';
import {initMenuBar} from '../menu-bar';
import {
	backupStoryDirectory,
	createStoryDirectory,
	initStoryDirectory
} from '../story-directory';
import {cleanScratchDirectory} from '../scratch-file';

jest.mock('electron');
jest.mock('../app-prefs');
jest.mock('../ipc');
jest.mock('../locales');
jest.mock('../menu-bar');
jest.mock('../story-directory');
jest.mock('../scratch-file');

describe('initApp', () => {
	const initIpcMock = initIpc as jest.Mock;
	const initLocalesMock = initLocales as jest.Mock;
	const initMenuBarMock = initMenuBar as jest.Mock;
	const initStoryDirectoryMock = initStoryDirectory as jest.Mock;
	const backupStoryDirectoryMock = backupStoryDirectory as jest.Mock;
	const cleanScratchDirectoryMock = cleanScratchDirectory as jest.Mock;
	const createStoryDirectoryMock = createStoryDirectory as jest.Mock;
	const onMock = app.on as jest.Mock;
	const quitMock = app.quit as jest.Mock;
	const showErrorBoxMock = dialog.showErrorBox as jest.Mock;

	beforeEach(() => jest.spyOn(global, 'setInterval'));

	it('initializes locales', async () => {
		await initApp();
		expect(initLocalesMock).toBeCalledTimes(1);
	});

	it('initializes the story directory', async () => {
		await initApp();
		expect(initStoryDirectoryMock).toBeCalledTimes(1);
	});

	it('creates the story directory', async () => {
		await initApp();
		expect(createStoryDirectoryMock).toBeCalledTimes(1);
	});

	it('backs up the story directory', async () => {
		await initApp();
		expect(backupStoryDirectoryMock).toBeCalledTimes(1);
	});

	it('initializes backing up the story directory every 20 minutes', async () => {
		await initApp();
		expect((global.setInterval as unknown as jest.Mock).mock.calls).toEqual([
			[backupStoryDirectory, 1000 * 60 * 20]
		]);
	});

	it('sets an event listener to clean the scratch directory when quitting', async () => {
		await initApp();

		const onQuit = onMock.mock.calls.find(([event]) => event === 'will-quit');

		expect(onQuit).not.toBeUndefined();
		expect(cleanScratchDirectoryMock).not.toBeCalled();
		onQuit[1]();
		expect(cleanScratchDirectoryMock).toBeCalledTimes(1);
	});

	it('initializes IPC', async () => {
		await initApp();
		expect(initIpcMock).toBeCalledTimes(1);
	});

	it('initializes the menu bar', async () => {
		await initApp();
		expect(initMenuBarMock).toBeCalledTimes(1);
	});

	it.todo('creates the main window');
	it.todo('injects user CSS into the main window if available');

	it('does not show an error dialog when everything loads', async () => {
		await initApp();
		expect(showErrorBoxMock).not.toBeCalled();
	});

	it('displays an error dialog and quits if an error occurs', async () => {
		initLocalesMock.mockRejectedValue(new Error());
		await initApp();
		expect(showErrorBoxMock).toBeCalledTimes(1);
		expect(quitMock).toBeCalledTimes(1);
	});
});
