import {formatEditorExtensionsDisabled} from '../getters';
import {fakePrefs} from '../../../test-util';
import {PrefsState} from '../prefs.types';

describe('formatEditorExtensionsDisabled()', () => {
	let prefs: PrefsState;

	beforeEach(() => (prefs = fakePrefs()));

	it('returns true if the user preference contains the format and version', () =>
		expect(
			formatEditorExtensionsDisabled(
				prefs,
				prefs.disabledStoryFormatEditorExtensions[0].name,
				prefs.disabledStoryFormatEditorExtensions[0].version
			)
		).toBe(true));

	it('returns false if the format name does not match', () =>
		expect(
			formatEditorExtensionsDisabled(
				prefs,
				prefs.disabledStoryFormatEditorExtensions[0].name + ' bad',
				prefs.disabledStoryFormatEditorExtensions[0].version
			)
		).toBe(false));

	it('returns false if the format version does not match', () =>
		expect(
			formatEditorExtensionsDisabled(
				prefs,
				prefs.disabledStoryFormatEditorExtensions[0].name,
				prefs.disabledStoryFormatEditorExtensions[0].version + ' bad'
			)
		).toBe(false));

	it('retursn false if neither name or version match', () =>
		expect(
			formatEditorExtensionsDisabled(
				prefs,
				prefs.disabledStoryFormatEditorExtensions[0].name + 'bad',
				prefs.disabledStoryFormatEditorExtensions[0].version + ' bad'
			)
		).toBe(false));
});
