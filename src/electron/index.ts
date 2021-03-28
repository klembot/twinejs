import {app, BrowserWindow, screen, shell} from 'electron';
import installExtension, {
	REACT_DEVELOPER_TOOLS
} from 'electron-devtools-installer';
import path from 'path';
import {hydrateGlobalData} from './hydrate-data';
import {initLocales} from './locales';
import {initMenuBar} from './menu-bar';

let mainWindow: BrowserWindow | null;

async function createWindow() {
	const screenSize = screen.getPrimaryDisplay().workAreaSize;

	// TODO: choose better window dimensions
	// TODO: not starting up in built mode anymore

	mainWindow = new BrowserWindow({
		height: screenSize.height * 1,
		width: screenSize.width * 1,
		show: false,
		webPreferences: {
			enableRemoteModule: true,
			nodeIntegration: false,
			preload: path.resolve(__dirname, './preload.js')
		}
	});
	mainWindow.loadURL(
		// Path is relative to this file in the electron-build/ directory that's created
		// during `npm run build:electron``.
		app.isPackaged
			? `file://${path.resolve(__dirname, '../../../index.html')}`
			: 'http://localhost:3000'
	);

	if (!app.isPackaged) {
		await installExtension(REACT_DEVELOPER_TOOLS);
	}

	mainWindow.once('ready-to-show', () => {
		mainWindow!.show();
		mainWindow!.webContents.openDevTools();
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
	initMenuBar();
	await hydrateGlobalData();
	createWindow();
});

app.on('window-all-closed', () => app.quit());
