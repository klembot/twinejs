import {app, protocol, BrowserWindow, shell} from 'electron';
import installExtension, {VUEJS_DEVTOOLS} from 'electron-devtools-installer';
import path from 'path';
import {createProtocol} from 'vue-cli-plugin-electron-builder/lib';
import {
	backupStoryDirectory,
	createStoryDirectory,
	lockStoryDirectory,
	unlockStoryDirectory
} from './story-directory';
import {loadStories} from './story-file';
import initMenuBar from './menu-bar';
import {load as loadJson} from './json-file';
import {setLocale} from '../util/i18n';
import './open-with-temp-file';

global.hydrate = {};

/*
vue-electron-builder boilerplate.
*/

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.

let win;

const isDevelopment = process.env.NODE_ENV !== 'production';

protocol.registerSchemesAsPrivileged([
	{scheme: 'app', privileges: {secure: true, standard: true}}
]);

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
	if (process.platform === 'win32') {
		process.on('message', data => {
			if (data === 'graceful-exit') {
				app.quit();
			}
		});
	} else {
		process.on('SIGTERM', () => {
			app.quit();
		});
	}
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
	/*
	Install Vue dev tools if we're doing local dev.
	*/

	if (isDevelopment && !process.env.IS_TEST) {
		try {
			await installExtension(VUEJS_DEVTOOLS);
		} catch (e) {
			console.error('Vue Devtools failed to install: ', e.toString());
		}
	}

	/*
	Twine-specific init begins here.
	*/

	initMenuBar();
	await lockStoryDirectory();
	setInterval(backupStoryDirectory, 1000 * 60 * 20);

	try {
		global.hydrate.prefs = await loadJson('prefs.json');
		await setLocale(global.hydrate.prefs.locale);
	} catch (e) {
		/*
		We can recover from this because the render process will set defaults,
		and we configure a fallback locale in src/i18n.js.
		*/

		console.warn(`Could not load prefs.json, skipping: ${e}`);
	}

	try {
		global.hydrate.storyFormats = await loadJson('story-formats.json');
	} catch (e) {
		/* We can recover from this because the render process will set defaults. */
		console.warn(`Could not load story-formats.json, skipping: ${e}`);
	}

	await createStoryDirectory();
	global.hydrate.stories = await loadStories();

	/*
	Create our app window. When it closes, the app quits.
	*/

	win = new BrowserWindow({
		width: 1024,
		height: 600,
		show: false,
		webPreferences: {
			enableRemoteModule: true,
			nodeIntegration: false,
			/* This also needs to be set in vue.config.js. */
			preload: path.resolve(__dirname, './preload.js')
		}
	});
	win.on('ready-to-show', () => win.show());
	win.on('closed', () => app.quit());
	win.webContents.on('new-window', (event, url) => {
		shell.openExternal(url);
		event.preventDefault();
	});

	/*
	Connect the window to the dev server if we're doing local dev; otherwise,
	load the app as bundled.
	*/

	if (process.env.WEBPACK_DEV_SERVER_URL) {
		win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);

		if (!process.env.IS_TEST) {
			win.webContents.openDevTools();
		}
	} else {
		createProtocol('app');
		win.loadURL('app://./index.html');
	}
});

/*
This needs to be using a process event, not the app one, because app events do
not trigger on Windows during a reboot or logout. See
https://electronjs.org/docs/api/app#event-quit
*/

process.on('exit', unlockStoryDirectory);
