import {fakePrefs} from '../../test-util';
import {codeMirrorOptionsFromPrefs} from '../codemirror-options';

describe('codeMirrorOptionsFromPrefs', () => {
	it('unmaps the Insert key to prevent going into overstrike mode', () => {
		const result = codeMirrorOptionsFromPrefs(fakePrefs());

		// Type definition here seems off--removing the cast shows an error.

		expect((result.extraKeys as any).Insert()).toBe(undefined);
	});

	it('turns off the cursor blink if that preference is set', () => {
		const result = codeMirrorOptionsFromPrefs(
			fakePrefs({editorCursorBlinks: false})
		);

		expect(result.cursorBlinkRate).toBe(0);
	});

	it("doesn' change the cursor blink rate if that preference is set", () => {
		const result = codeMirrorOptionsFromPrefs(
			fakePrefs({editorCursorBlinks: true})
		);

		expect(result.cursorBlinkRate).toBeUndefined();
	});
});
