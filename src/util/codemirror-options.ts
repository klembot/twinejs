import {EditorConfiguration} from 'codemirror';
import {PrefsState} from '../store/prefs';

/**
 * Returns baseline CodeMirror options based on user preferences.
 */
export function codeMirrorOptionsFromPrefs(
	prefs: PrefsState
): EditorConfiguration {
	// Disable overstrike mode.

	let result: EditorConfiguration = {
		extraKeys: {
			Insert() {}
		}
	};

	if (!prefs.editorCursorBlinks) {
		result.cursorBlinkRate = 0;
	}

	return result;
}
