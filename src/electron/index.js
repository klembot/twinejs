/*
Bootstraps the Electron app. This listens for `app-relaunch` IPC messages and
relaunches the app when one is received.
*/

const {app, dialog, ipcMain, BrowserWindow, shell} = require('electron');
const path = require('path');
const {
	backup: backupStoryDirectory,
	create: createStoryDirectory,
	lock: lockStoryDirectory,
	unlock: unlockStoryDirectory
} = require('./story-directory');
const {load: loadJson} = require('./json-file');
const loadLocale = require('./load-locale');
const {load: loadStories} = require('./story-file');
const initMenuBar = require('./menu-bar');
require('./open-with-temp-file');

const browserWindowOpts = {
	width: 1024,
	height: 600,
	webPreferences: {
		nodeIntegration: false,
		preload: path.resolve(__dirname, './preload.js')
	}
};

/*
A place for state to be stored to be hydrated in the render process. This is
read by src/data/file-system. Note that this is not a continuous thing-- we
update windows when they first open, so it is currently not possible to have two
BrowserWindows making changes simultaneously and staying in sync. This is OK for
our current use case, because separate windows are only used for testing and
playing stories.
*/

global.hydrate = {};

function updateDataToHydrate() {
	return lockStoryDirectory()
		.then(loadStories)
		.then(storyData => {
			global.hydrate.initialStoryData = storyData;
			return storyData;
		})
		.then(unlockStoryDirectory)
		.then(() => loadJson('story-formats.json'))
		.then(data => (global.hydrate.storyFormats = data))
		.then(() => loadJson('prefs.json'))
		.then(data => (global.hydrate.prefs = data))
		.catch(e => console.warn(e.message));
}

function addStockWindowListeners(win) {
	win.webContents.on('new-window', (event, url) => {
		if (/^file:\/\/\//.test(url)) {
			/*
			Open local URLs in a new BrowserWindow, as above.
			*/

			updateDataToHydrate().then(() => {
				const bounds = win.getBounds();
				const newWin = new BrowserWindow(
					Object.assign({}, browserWindowOpts, {
						x: bounds.x + 25,
						y: bounds.y + 25
					})
				);

				addStockWindowListeners(newWin);
				newWin.loadURL(url);
			});
		} else {
			/*
			Open everything else in the user's browser.
			*/

			shell.openExternal(url);
		}

		event.preventDefault();
	});
}

app.on('ready', () => {
	let startupTask;

	backupStoryDirectory()
		.then(() => setInterval(backupStoryDirectory, 1000 * 60 * 20))
		.then(() => loadJson('prefs.json'))
		.then(data => (global.hydrate.prefs = data))
		.catch(e => console.warn(e.message))
		.then(() => {
			startupTask = 'loading your locale preference';
			return loadLocale(global.hydrate.prefs);
		})
		.then(() => loadJson('story-formats.json'))
		.then(data => (global.hydrate.storyFormats = data))
		.catch(e => console.warn(e.message))
		.then(() => {
			startupTask = 'creating a story directory if needed';
			return createStoryDirectory();
		})
		.then(() => {
			startupTask = 'loading your story library';
			return updateDataToHydrate();
		})
		.then(() => {
			startupTask = 'setting up the Twine window';
			initMenuBar();

			const win = new BrowserWindow(
				Object.assign({}, browserWindowOpts, {show: false})
			);

			addStockWindowListeners(win);
			win.on('ready-to-show', () => {
				win.show();
			});
			win.on('closed', () => {
				app.quit();
			});

			win.loadFile('dist/web-electron/index.html');
		})
		.catch(e => {
			dialog.showMessageBox(
				null,
				{
					type: 'error',
					message: `An error occurred during startup while ${startupTask}.`,
					detail: e.message,
					buttons: ['Quit']
				},
				() => app.exit()
			);
		});
});

ipcMain.on('app-relaunch', () => {
	app.relaunch();
	app.quit();
});

/*
This needs to be using a process event, not the app one, because app events do
not trigger on Windows during a reboot or logout. See
https://electronjs.org/docs/api/app#event-quit
*/

process.on('exit', unlockStoryDirectory);
