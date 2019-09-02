/*
A central function to load the Twine 2 guide in an external browser.
*/

import {shell} from 'electron';

export default {
	openHelp() {
		shell.openExternal('https://twinery.org/2guide');
	}
};
