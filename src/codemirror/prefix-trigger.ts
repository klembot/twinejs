// This automatically triggers a function when typing a word that is prefixed by
// certain text. We use this to automatically pop open the autocomplete when the
// user is probably typing a passage name.

import CodeMirror from 'codemirror';
import {Editor} from 'codemirror';

let attachments: Editor[] = [];

export interface CMPrefixTriggerOptions {
	/**
	 * Called when the user types a prefix in.
	 */
	callback?: (editor: Editor) => void;
	/**
	 * An array of strings that will trigger the callback, case-sensitive.
	 */
	prefixes?: string[];
}

export function prefixTriggerOption(
	cm: Editor,
	options: CMPrefixTriggerOptions
) {
	const {prefixes, callback} = options;

	function checkTrigger(cm: Editor) {
		if (cm.state.completionActive || !prefixes || !callback) {
			return;
		}

		// Back up two words from the cursor.

		const curWord = cm.findWordAt(cm.getDoc().getCursor());

		curWord.anchor.ch--;

		const prevWordRange = cm.findWordAt(curWord.anchor);
		const prevWord = cm.getRange(prevWordRange.anchor, prevWordRange.head);

		// Do we have a match? Only trigger this once.

		for (const prefix of prefixes) {
			if (prevWord === prefix) {
				callback(cm);
				return;
			}
		}
	}

	if (callback && prefixes && !attachments.includes(cm)) {
		attachments.push(cm);
		cm.on('inputRead', checkTrigger);
	} else if (attachments.includes(cm)) {
		cm.off('inputRead', checkTrigger);
		attachments = attachments.filter(editor => editor !== cm);
	}
}

let inited = false;

export function initPrefixTriggerGlobally() {
	if (!inited) {
		CodeMirror.defineOption('prefixTrigger', [], prefixTriggerOption);
		inited = true;
	}
}
