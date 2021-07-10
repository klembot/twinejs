import {app, BrowserWindow, screen, shell} from 'electron';
import path from 'path';
import {hydrateGlobalData} from './hydrate-data';
import {initIpc} from './ipc';
import {initLocales} from './locales';
import {initMenuBar} from './menu-bar';

let mainWindow: BrowserWindow | null;

async function createWindow() {
	const screenSize = screen.getPrimaryDisplay().workAreaSize;

	mainWindow = new BrowserWindow({
		height: Math.round(screenSize.height * 0.9),
		width: Math.round(screenSize.width * 0.9),
		show: false,
		webPreferences: {
			// See preload.ts for why context isolation is disabled.
			contextIsolation: false,
			enableRemoteModule: true,
			nodeIntegration: false,
			preload: path.resolve(__dirname, './preload.js')
		}
	});
	mainWindow.loadURL(
		// Path is relative to this file in the electron-build/ directory that's
		// created during `npm run build:electron-main`.
		// app.isPackaged
		`file://${path.resolve(__dirname, '../../../../renderer/index.html')}`
	);

	mainWindow.once('ready-to-show', () => {
		mainWindow!.show();

		if (!app.isPackaged) {
			mainWindow!.webContents.openDevTools();
		}
	});
	mainWindow.on('closed', () => (mainWindow = null));
	mainWindow.webContents.setWindowOpenHandler(({url}) => {
		// TODO: is this right?
		shell.openExternal(url);
		return {action: 'allow'};
	});
}

app.on('ready', async () => {
	initLocales();
	initIpc();
	initMenuBar();
	await hydrateGlobalData();
	createWindow();
});

app.on('window-all-closed', () => app.quit());
