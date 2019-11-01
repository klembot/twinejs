/*
Opens an external URL. This is abstracted to a module because we do this
differently in Electron.
*/

// TODO
// import isElectron from './is-electron';

export default function openUrl(url) {
	window.open(url, '_blank');
}
