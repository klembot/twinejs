import {app} from 'electron';
import {getAppPref, setAppPref} from './app-prefs';
import {showRelaunchDialog} from './relaunch-dialog';

export function initHardwareAcceleration() {
	if (getAppPref('disableHardwareAcceleration')) {
		console.log('Disabling hardware acceleration');
		app.disableHardwareAcceleration();
	}
}

export function toggleHardwareAcceleration() {
	setAppPref(
		'disableHardwareAcceleration',
		!getAppPref('disableHardwareAcceleration')
	);
	showRelaunchDialog();
}
