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
					// Get the current cursor position and line content.

					const cursor = editor.getCursor();
					const line = editor.getLine(cursor.line);
					const from = {...cursor};
					const to = {...cursor};

					// Expand the range to the first `[` before the cursor. lastIndexOf()
					// will either give us -1, if there was no match, or the first
					// bracket. In either case, we want to add one so that it either
					// points to the start of the line, or the first character after the
					// match. e.g. `[passage name` becomes `passage name`.

					from.ch = line.lastIndexOf('[', from.ch) + 1;

					const candidate = line.substring(from.ch, to.ch).toLowerCase();
					const comps = {
						from,
						to,
						list: story.passages.reduce<string[]>((result, passage) => {
							if (passage.name.toLowerCase().includes(candidate)) {
								return [...result, passage.name];
							}

							return result;
						}, [])
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
