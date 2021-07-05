export const app = {
	getName() {
		return `mock-electron-app-name`;
	},
	getPath(name: string) {
		return `mock-electron-app-path-${name}`;
	},
	quit: jest.fn(),
	relaunch: jest.fn()
};

export const BrowserWindow = {
	getFocusedWindow: jest.fn()
};

export const dialog = {
	showErrorBox: jest.fn(),
	showMessageBox: jest.fn().mockResolvedValue({response: 0})
};

export const ipcMain = {
	on: jest.fn()
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
