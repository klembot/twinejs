import {app, dialog} from 'electron';
import {initApp} from '../init-app';
import {initIpc} from '../ipc';
import {initLocales} from '../locales';
import {initMenuBar} from '../menu-bar';
import {backupStoryDirectory, createStoryDirectory} from '../story-directory';

jest.mock('electron');
jest.mock('../ipc');
jest.mock('../locales');
jest.mock('../menu-bar');
jest.mock('../story-directory');

describe('initApp', () => {
	const initIpcMock = initIpc as jest.Mock;
	const initLocalesMock = initLocales as jest.Mock;
	const initMenuBarMock = initMenuBar as jest.Mock;
	const backupStoryDirectoryMock = backupStoryDirectory as jest.Mock;
	const createStoryDirectoryMock = createStoryDirectory as jest.Mock;
	const quitMock = app.quit as jest.Mock;
	const showErrorBoxMock = dialog.showErrorBox as jest.Mock;

	beforeEach(() => jest.spyOn(global, 'setInterval'));

	it('initializes locales', async () => {
		await initApp();
		expect(initLocalesMock).toBeCalledTimes(1);
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
		expect((global.setInterval as jest.Mock).mock.calls).toEqual([
			[backupStoryDirectory, 1000 * 60 * 20]
		]);
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
