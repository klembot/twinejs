import {PrefsState} from './prefs.types';

/**
 * Returns whether the user has disabled editor extensions for a story format.
 */
export function formatEditorExtensionsDisabled(
	prefs: PrefsState,
	name: string,
	version: string
) {
	return prefs.disabledStoryFormatEditorExtensions.some(
		f => f.name === name && f.version === version
	);
}
