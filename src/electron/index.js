/*
Bootstraps the Electron app.
*/

const {app, dialog, BrowserWindow} = require('electron');
const path = require('path');
const {
	create: createStoryDirectory,
	lock: lockStoryDirectory,
	unlock: unlockStoryDirectory
} = require('./story-directory');
const {load: loadJson} = require('./json-file');
const {load: loadStories} = require('./story-file');
const initMenuBar = require('./menu-bar');

/* A place for state to be stored to be hydrated in the render process. */

global.hydrate = {};

app.on('ready', () => {
	loadJson('prefs.json')
		.then(data => (global.hydrate.prefs = data))
		.catch(e => console.warn(e.message))
		.then(() => loadJson('story-formats.json'))
		.then(data => (global.hydrate.storyFormats = data))
		.catch(e => console.warn(e.message))
		.then(createStoryDirectory)
		.then(lockStoryDirectory)
		.then(loadStories)
		.then(storyData => {
			/* Leave this for src/data/file-system. */

			global.hydrate.initialStoryData = storyData;

			initMenuBar();

			const win = new BrowserWindow({
				width: 1024,
				height: 600,
				show: false,
				webPreferences: {
					nodeIntegration: false,
					preload: path.resolve(__dirname, './preload.js')
				}
			});

			win.on('ready-to-show', () => {
				win.show();
			});

			win.loadFile('dist/web-electron/index.html');
			win.on('closed', () => {
				app.quit();
			});
		})
		.catch(e => {
			dialog.showMessageBox(
				null,
				{
					type: 'error',
					message: 'An error occurred during startup.',
					detail: e.message,
					buttons: ['Quit']
				},
				() => app.exit()
			);
		});
});

/*
This needs to be using a process event, not the app one, because app events do
not trigger on Windows during a reboot or logout. See
https://electronjs.org/docs/api/app#event-quit
*/

process.on('exit', unlockStoryDirectory);
