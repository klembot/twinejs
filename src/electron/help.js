/*
A central function to load the Twine 2 guide in an external browser.
*/

const {shell} = require('electron');

module.exports = {
	openHelp() {
		shell.openExternal('https://twinery.org/2guide');
	}
};
