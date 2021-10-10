import {
	markPassageMatches,
	passageWithId,
	passageWithName,
	storyPassageTags,
	storyWithId,
	storyWithName,
	storyTags
} from '../getters';
import {Story} from '../stories.types';
import {fakePassage, fakeStory} from '../../../test-util';
import {passageConnections} from '..';

describe('markPassageMatches()', () => {
	it.each([
		[
			'AaBbCc',
			'b',
			{},
			{
				nameHighlightedHtml: 'AaBbCc',
				textHighlightedHtml: 'Aa<mark>B</mark><mark>b</mark>Cc'
			}
		],
		[
			'AaBbCc',
			'b',
			{includePassageNames: true},
			{
				nameHighlightedHtml: 'Aa<mark>B</mark><mark>b</mark>Cc',
				textHighlightedHtml: 'Aa<mark>B</mark><mark>b</mark>Cc'
			}
		],
		[
			'AaBbCc',
			'B',
			{matchCase: true},
			{
				nameHighlightedHtml: 'AaBbCc',
				textHighlightedHtml: 'Aa<mark>B</mark>bCc'
			}
		],
		[
			'AaBbCc',
			'B',
			{includePassageNames: true, matchCase: true},
			{
				nameHighlightedHtml: 'Aa<mark>B</mark>bCc',
				textHighlightedHtml: 'Aa<mark>B</mark>bCc'
			}
		]
	])(
		'highlights "%s" searching for "%s" with flags %j as %j',
		(text, search, flags, result) => {
			const passage = fakePassage({name: text, text});

			expect(markPassageMatches(passage, search, flags)).toEqual(result);
		}
	);
});

describe('passageConnections', () => {
	it('places links between two unselected passages in the fixed property', () => {
		const passages = [
			fakePassage({name: 'a', selected: false, text: '[[b]]'}),
			fakePassage({name: 'b', selected: false, text: ''})
		];

		expect(passageConnections(passages)).toEqual({
			fixed: {
				broken: new Set(),
				connections: new Map([[passages[0], new Set([passages[1]])]]),
				self: new Set()
			},
			draggable: {
				broken: new Set(),
				connections: new Map(),
				self: new Set()
			}
		});
	});

	it('places links between a selected and an unselected passage in the draggable property', () => {
		const passages = [
			fakePassage({name: 'a', selected: true, text: '[[b]]'}),
			fakePassage({name: 'b', selected: false, text: ''})
		];

		expect(passageConnections(passages)).toEqual({
			fixed: {
				broken: new Set(),
				connections: new Map(),
				self: new Set()
			},
			draggable: {
				broken: new Set(),
				connections: new Map([[passages[0], new Set([passages[1]])]]),
				self: new Set()
			}
		});
	});

	it('places links between two selected passages in the draggable property', () => {
		const passages = [
			fakePassage({name: 'a', selected: true, text: '[[b]]'}),
			fakePassage({name: 'b', selected: true, text: ''})
		];

		expect(passageConnections(passages)).toEqual({
			fixed: {
				broken: new Set(),
				connections: new Map(),
				self: new Set()
			},
			draggable: {
				broken: new Set(),
				connections: new Map([[passages[0], new Set([passages[1]])]]),
				self: new Set()
			}
		});
	});

	it('places a self link of a selected passage in the draggable property', () => {
		const passage = fakePassage({name: 'a', selected: true, text: '[[a]]'});

		expect(passageConnections([passage])).toEqual({
			fixed: {
				broken: new Set(),
				connections: new Map(),
				self: new Set()
			},
			draggable: {
				broken: new Set(),
				connections: new Map(),
				self: new Set([passage])
			}
		});
	});

	it('places a self link of an unselected passage in the fixed property', () => {
		const passage = fakePassage({name: 'a', selected: false, text: '[[a]]'});

		expect(passageConnections([passage])).toEqual({
			fixed: {
				broken: new Set(),
				connections: new Map(),
				self: new Set([passage])
			},
			draggable: {
				broken: new Set(),
				connections: new Map(),
				self: new Set()
			}
		});
	});

	it('places a broken link of a selected passage in the draggable property', () => {
		const passage = fakePassage({name: 'a', selected: true, text: '[[b]]'});

		expect(passageConnections([passage])).toEqual({
			fixed: {
				broken: new Set(),
				connections: new Map(),
				self: new Set()
			},
			draggable: {
				broken: new Set([passage]),
				connections: new Map(),
				self: new Set()
			}
		});
	});

	it('places a broken link of an unselected passage in the draggable property', () => {
		const passage = fakePassage({name: 'a', selected: false, text: '[[b]]'});

		expect(passageConnections([passage])).toEqual({
			fixed: {
				broken: new Set([passage]),
				connections: new Map(),
				self: new Set()
			},
			draggable: {
				broken: new Set(),
				connections: new Map(),
				self: new Set()
			}
		});
	});
});

describe('passageWithId()', () => {
	let story: Story;

	beforeEach(() => (story = fakeStory(3)));

	it('returns the matching passage in a story', () =>
		expect(passageWithId([story], story.id, story.passages[0].id)).toBe(
			story.passages[0]
		));

	it('throws an error if there is no matching story', () =>
		expect(() =>
			passageWithId([story], story.id + 'nonexistent', story.passages[0].id)
		).toThrow());

	it('throws an error if there is no matching passage', () =>
		expect(() =>
			passageWithId([story], story.id, story.passages[0].id + 'nonexistent')
		).toThrow());
});

describe('passageWithName()', () => {
	let story: Story;

	beforeEach(() => (story = fakeStory(3)));

	it('returns the matching passage in a story', () =>
		expect(passageWithName([story], story.id, story.passages[0].name)).toBe(
			story.passages[0]
		));

	it('throws an error if there is no matching story', () =>
		expect(() =>
			passageWithName([story], story.id + 'nonexistent', story.passages[0].name)
		).toThrow());

	it('throws an error if there is no matching passage', () =>
		expect(() =>
			passageWithName([story], story.id, story.passages[0].name + 'nonexistent')
		).toThrow());
});

describe('storyPassageTags()', () => {
	it('returns a sorted array of unique tags across passages', () => {
		const story = fakeStory(2);

		story.passages[0].tags = ['c', 'a'];
		story.passages[1].tags = ['a', 'b'];

		expect(storyPassageTags(story)).toEqual(['a', 'b', 'c']);
	});

	it('ignores stories with no tags property', () => {
		const story = fakeStory(2);

		delete (story.passages[0] as any).tags;
		story.passages[1].tags = ['a'];
		expect(storyPassageTags(story)).toEqual(['a']);
	});
});

describe('storyTags()', () => {
	it('returns a sorted array of unique tags across stories', () => {
		const stories = [fakeStory(), fakeStory()];

		stories[0].tags = ['c', 'a'];
		stories[1].tags = ['a', 'b'];

		expect(storyTags(stories)).toEqual(['a', 'b', 'c']);
	});

	it('ignores stories with no tags property', () => {
		const stories = [fakeStory(), fakeStory()];

		delete (stories[0] as any).tags;
		stories[1].tags = ['a'];
		expect(storyTags(stories)).toEqual(['a']);
	});
});

describe('storyWithId()', () => {
	let story: Story;

	beforeEach(() => (story = fakeStory()));

	it('returns the matching story', () =>
		expect(storyWithId([fakeStory(), story, fakeStory()], story.id)).toBe(
			story
		));

	it('throws an error if there is no matching story', () =>
		expect(() => storyWithId([story], story.id + 'nonexistent')).toThrow());
});

describe('storyWithName()', () => {
	let story: Story;

	beforeEach(() => (story = fakeStory()));

	it('returns the matching story', () =>
		expect(storyWithName([fakeStory(), story, fakeStory()], story.name)).toBe(
			story
		));

	it('throws an error if there is no matching story', () =>
		expect(() => storyWithName([story], story.name + 'nonexistent')).toThrow());
});
