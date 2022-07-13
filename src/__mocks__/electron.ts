export const app = {
	getName() {
		return `mock-electron-app-name`;
	},
	getPath(name: string) {
		return `mock-electron-app-path-${name}`;
	},
	on: jest.fn(),
	quit: jest.fn(),
	relaunch: jest.fn()
};

export class BrowserWindow {
	constructor() {
		(this as any).webContents = {
			on: jest.fn(),
			setWindowOpenHandler: jest.fn()
		};
	}

	loadURL() {}
	on() {}
	once() {}

	static getFocusedWindow = jest.fn();
}

export const dialog = {
	showErrorBox: jest.fn(),
	showMessageBox: jest.fn().mockResolvedValue({response: 0})
};

export const ipcMain = {
	handle: jest.fn(),
	on: jest.fn()
};

export const screen = {
	getPrimaryDisplay() {
		return {workAreaSize: {height: 480, width: 640}};
	}
};

export const shell = {
	openExternal: jest.fn(),
	openPath: jest.fn(),
	trashItem: jest.fn()
};

export const Menu = {
	buildFromTemplate: (template: any) => template,
	setApplicationMenu: jest.fn()
};
