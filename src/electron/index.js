const {app, BrowserWindow} = require('electron');

app.on('ready', () => {
	const win = new BrowserWindow({width: 800, height: 600, show: false});

	win.on('ready-to-show', () => {
		win.show();
	});

	win.loadURL('http://nytimes.com');
	win.on('closed', () => {
		app.quit();
	});
});
