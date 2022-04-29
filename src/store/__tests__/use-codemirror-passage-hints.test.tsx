import {renderHook} from '@testing-library/react-hooks';
import {fakeStory} from '../../test-util';
import {useCodeMirrorPassageHints} from '../use-codemirror-passage-hints';

describe('useCodeMirrorPassageHints()', () => {
	// These tests are very basic--much better would be to run actual CodeMirror.

	it('returns a list of passages whose names match the word at the cursor', () => {
		const fakeEditor = {
			findWordAt: () => ({anchor: 0, head: 0}),
			getCursor: jest.fn(),
			getRange: () => 'a',
			showHint: jest.fn()
		};
		const story = fakeStory(3);

		story.passages[0].name = 'aaa';
		story.passages[1].name = 'baa';
		story.passages[2].name = 'ccc';

		const {result} = renderHook(() => useCodeMirrorPassageHints(story));

		result.current(fakeEditor as any);
		expect(fakeEditor.showHint.mock.calls[0][0].hint().list).toEqual([
			'aaa',
			'baa'
		]);
	});

	it('is case-insensitive', () => {
		const fakeEditor = {
			findWordAt: () => ({anchor: 0, head: 0}),
			getCursor: jest.fn(),
			getRange: () => 'a',
			showHint: jest.fn()
		};
		const story = fakeStory(3);

		story.passages[0].name = 'AAA';
		story.passages[1].name = 'bAA';
		story.passages[2].name = 'ccc';

		const {result} = renderHook(() => useCodeMirrorPassageHints(story));

		result.current(fakeEditor as any);
		expect(fakeEditor.showHint.mock.calls[0][0].hint().list).toEqual([
			'AAA',
			'bAA'
		]);
	});
});
