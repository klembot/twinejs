import CodeMirror, {Editor, Handle} from 'codemirror';
import * as React from 'react';
import {Story} from './stories';

type HintExtraKeyHandler = (editor: Editor, hint: Handle) => void;

export function useCodeMirrorPassageHints(story: Story) {
	return React.useCallback(
		(editor: Editor) => {
			editor.showHint({
				completeSingle: false,
				extraKeys:
					// Any of the characters below are an indication the user is finished
					// typing a passage name in a link and the hint should close. We need
					// to 'type' this character for the user since our handler consumes
					// the event.
					[']', '-', '|'].reduce<Record<string, HintExtraKeyHandler>>(
						(result, character) => {
							result[character] = (editor, hint) => {
								const doc = editor.getDoc();

								doc.replaceRange(character, doc.getCursor());
								hint.close();
							};

							return result;
						},
						{}
					),
				hint() {
					const wordRange = editor.findWordAt(editor.getCursor());
					const word = editor
						.getRange(wordRange.anchor, wordRange.head)
						.toLowerCase();

					const comps = {
						list: story.passages.reduce<string[]>((result, passage) => {
							if (passage.name.toLowerCase().includes(word)) {
								return [...result, passage.name];
							}

							return result;
						}, []),
						from: wordRange.anchor,
						to: wordRange.head
					};

					CodeMirror.on(comps, 'pick', () => {
						const doc = editor.getDoc();

						doc.replaceRange(']] ', doc.getCursor());
					});

					return comps;
				}
			});
		},
		[story.passages]
	);
}
