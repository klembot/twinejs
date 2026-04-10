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

					// Expand the range to the first `[`, '|', or `->` before the cursor,
					// preferring `->` if it's present because it means we're in a
					// `[[label->link]]` situation. lastIndexOf() will either give us -1,
					// if there was no match, or the first `[` or `-` (the first character
					// of `->`). In either case, we want to add one so that it either
					// points to the start of the line, or the first character after the
					// match. e.g. `[passage name` becomes `passage name`.

					let startIndex = line.lastIndexOf('->', from.ch);

					if (startIndex === -1) {
						startIndex = Math.max(line.lastIndexOf('[', from.ch), line.lastIndexOf('|', from.ch));
					} else {
						// We matched an arrow and need to move one character forward to
						// match the behavior of searching for a single bracket.
						startIndex++;
					}

					from.ch = startIndex + 1;

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
