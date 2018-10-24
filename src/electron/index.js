const {app, BrowserWindow} = require('electron');

app.on('ready', () => {
	const win = new BrowserWindow({width: 1024, height: 600, show: false});

	win.on('ready-to-show', () => {
		win.show();
	});

	win.loadFile('dist/web/index.html');
	win.on('closed', () => {
		app.quit();
	});
});
