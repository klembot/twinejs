import CodeMirror, {Editor} from 'codemirror';
import * as React from 'react';
import {Story} from './stories';

export function useCodeMirrorPassageHints(story: Story) {
	return React.useCallback(
		(editor: Editor) => {
			editor.showHint({
				completeSingle: false,
				closeCharacters: /\]/,
				hint() {

					const doc        = editor.getDoc();
					const cursor     = editor.getCursor();
					const wordRange  = editor.findWordAt(cursor);
					const linkCursor = doc.getSearchCursor(/\[\[|->|\|/,cursor);
					const linkMatch  = linkCursor.findPrevious();
					const linkDelim  = Array.isArray(linkMatch) ? linkMatch[0] : '';
					const linkStart  = linkCursor.from();
					      linkStart.ch += linkDelim.length;
					const word = editor
						.getRange(linkStart, cursor)
						.toLowerCase();

					const comps = {
						list: story.passages.reduce<string[]>((result, passage) => {
							if (passage.name.toLowerCase().includes(word)) {
								return [...result, passage.name];
							}

							return result;
						}, []),
						from: linkStart,
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
