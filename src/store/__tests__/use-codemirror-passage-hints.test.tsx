import {renderHook} from '@testing-library/react-hooks';
import {fakeStory} from '../../test-util';
import {useCodeMirrorPassageHints} from '../use-codemirror-passage-hints';

describe('useCodeMirrorPassageHints()', () => {
	// These tests are very basic--much better would be to run actual CodeMirror.

	it('returns a list of passages whose names match the word at the cursor', () => {
		const fakeEditor = {
			getCursor: jest.fn(() => ({from: 0, line: 0, to: 0})),
			getLine: jest.fn(() => 'a'),
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
			getCursor: jest.fn(() => ({from: 0, line: 0, to: 0})),
			getLine: jest.fn(() => 'a'),
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

	it('completes passages using spaces if entered', () => {
		const fakeEditor = {
			getCursor: jest.fn(() => ({from: 0, line: 0, to: 0})),
			getLine: jest.fn(() => 'aaa b'),
			showHint: jest.fn()
		};
		const story = fakeStory(3);

		story.passages[0].name = 'aaa bbb';
		story.passages[1].name = 'ccc ddd';
		story.passages[2].name = 'eee fff';

		const {result} = renderHook(() => useCodeMirrorPassageHints(story));

		result.current(fakeEditor as any);
		expect(fakeEditor.showHint.mock.calls[0][0].hint().list).toEqual([
			'aaa bbb'
		]);
	});

	it('completes passages using spaces if entered', () => {
		const fakeEditor = {
			getCursor: jest.fn(() => ({from: 0, line: 0, to: 0})),
			getLine: jest.fn(() => 'aaa b'),
			showHint: jest.fn()
		};
		const story = fakeStory(3);

		story.passages[0].name = 'aaa bbb';
		story.passages[1].name = 'ccc ddd';
		story.passages[2].name = 'eee fff';

		const {result} = renderHook(() => useCodeMirrorPassageHints(story));

		result.current(fakeEditor as any);
		expect(fakeEditor.showHint.mock.calls[0][0].hint().list).toEqual([
			'aaa bbb'
		]);
	});

	it('considers characters entered after the [ on the same line, if present', () => {
		const fakeEditor = {
			getCursor: jest.fn(() => ({from: 6, line: 0, to: 6})),
			getLine: jest.fn(() => 'aaa [[cc'),
			showHint: jest.fn()
		};
		const story = fakeStory(3);

		story.passages[0].name = 'aaa bbb';
		story.passages[1].name = 'ccc ddd';
		story.passages[2].name = 'eee fff';

		const {result} = renderHook(() => useCodeMirrorPassageHints(story));

		result.current(fakeEditor as any);
		expect(fakeEditor.showHint.mock.calls[0][0].hint().list).toEqual([
			'ccc ddd'
		]);
	});
});
