/**
 * Is this code currently in an Electron renderer process? Returns false if
 * either this is running in the Electron main process, or Electron is not
 * involved at all.
 * @see https://github.com/electron/electron/issues/2288#issuecomment-337858978
 */
export const isElectronRenderer = () =>
	window.navigator.userAgent.indexOf('Electron') !== -1;

/**
 * Is this code currently running in an Electron main process? Returns false if
 * either this is running in an Electron renderer process, or Electron is not
 * involved at all.
 * @see https://github.com/electron/electron/issues/2288#issuecomment-611231970
 */

export const isElectronMain = () => process.versions.hasOwnProperty('electron');
