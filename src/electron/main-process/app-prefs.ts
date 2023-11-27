import minimist from 'minimist';
import {loadJsonFileSync, saveJsonFile} from './json-file';

/**
 * Name of an app-specific preference. These should only be used for preferences
 * that are related to the app build, e.g. things like folder locations.
 */
export type AppPrefName =
	| 'backupFolderPath'
	| 'disableHardwareAcceleration'
	| 'scratchFolderPath'
	| 'scratchFileCleanupAge'
	| 'storyLibraryFolderPath';

const prefNames: AppPrefName[] = [
	'backupFolderPath',
	'disableHardwareAcceleration',
	'scratchFolderPath',
	'scratchFileCleanupAge',
	'storyLibraryFolderPath'
];
const prefs: Partial<Record<AppPrefName, unknown>> = {};
let prefsLoaded = false;

/**
 * Loads app-specific (e.g. not shared by the browser version) prefs. This
 * *must* be called before getAppPref or setAppPref. This function is
 * synchronous because we need at least one app pref before Electron is ready,
 * and there is no way to delay readiness.
 *
 * @see https://github.com/electron/electron/issues/21370
 */
export function loadAppPrefs() {
	const argv = minimist(process.argv.slice(1));
	let appPrefFile: any = {};

	try {
		appPrefFile = loadJsonFileSync('app-prefs.json');
	} catch (error) {
		console.warn("Couldn't read app prefs file; continuing", error);
	}

	for (const prefName of prefNames) {
		prefs[prefName] = argv[prefName] ?? appPrefFile[prefName];
		console.log(
			`App pref ${prefName} set to ${JSON.stringify(prefs[prefName])}`
		);
	}

	prefsLoaded = true;
}

/**
 * Returns the value set for an app preference. The order of precendence is:
 *
 * 1. Values set by setAppPref()
 * 2. Command-line arguments
 * 3. The app preference file
 *
 * If no value has been set in any of the above places, this returns undefined.
 */
export function getAppPref(name: AppPrefName): unknown {
	if (!prefsLoaded) {
		throw new Error('Tried to get an app pref before they were loaded');
	}

	return prefs[name];
}

/**
 * Sets an app preference and saves it to the app preference file.
 */
export async function setAppPref(name: AppPrefName, value: unknown) {
	if (!prefsLoaded) {
		throw new Error('Tried to set an app pref before they were loaded');
	}

	prefs[name] = value;
	await saveJsonFile('app-prefs.json', prefs);
}
