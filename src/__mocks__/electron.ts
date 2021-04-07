export const app = {
	getPath(name: string) {
		return `mock-electron-app-path-${name}`;
	}
};

export const shell = {
	openPath: jest.fn()
};
