import {
	markPassageMatches,
	passageWithId,
	passageWithName,
	storyWithId,
	storyWithName,
	storyTags
} from '../getters';
import {Story} from '../stories.types';
import {fakePassage, fakeStory} from '../../../test-util/fakes';

describe('markPassageMatches', () => {
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

describe('passageWithId', () => {
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

describe('passageWithName', () => {
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

describe('storyTags', () => {
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

describe('storyWithId', () => {
	let story: Story;

	beforeEach(() => (story = fakeStory()));

	it('returns the matching story', () =>
		expect(storyWithId([fakeStory(), story, fakeStory()], story.id)).toBe(
			story
		));

	it('throws an error if there is no matching story', () =>
		expect(() => storyWithId([story], story.id + 'nonexistent')).toThrow());
});

describe('storyWithName', () => {
	let story: Story;

	beforeEach(() => (story = fakeStory()));

	it('returns the matching story', () =>
		expect(storyWithName([fakeStory(), story, fakeStory()], story.name)).toBe(
			story
		));

	it('throws an error if there is no matching story', () =>
		expect(() => storyWithName([story], story.name + 'nonexistent')).toThrow());
});
