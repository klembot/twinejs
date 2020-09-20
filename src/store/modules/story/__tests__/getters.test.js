import {fakeStoryObject} from '@/test-utils/fakes';
import {bindVuexGetters} from '@/test-utils/vuex';
import * as storyGetters from '../getters';

jest.mock('@/util/link-parser');

describe('story Vuex module getters', () => {
	let stories = [];
	let getters = {};

	beforeEach(() => {
		stories = [fakeStoryObject(1), fakeStoryObject(1), fakeStoryObject(1)];
		getters = bindVuexGetters(storyGetters, {stories});
	});

	describe('passageInStoryWithId', () => {
		it('finds a passage and story with a given ID', () =>
			expect(
				getters.passageInStoryWithId(stories[0].id, stories[0].passages[0].id)
			).toBe(stories[0].passages[0]));

		it("returns undefined if the story ID doesn't match any story", () =>
			expect(
				getters.passageInStoryWithId(
					'should not match',
					stories[0].passages[0].id
				)
			).toBeUndefined());

		it("returns undefined if the passage ID doesn't match any passage", () =>
			expect(
				getters.passageInStoryWithId(stories[0].id, null)
			).toBeUndefined());
	});

	describe('passagesInStoryMatchingSearch', () => {
		const searchableStory = fakeStoryObject(2);

		searchableStory.passages[0].name = 'matching-passage-name';
		searchableStory.passages[0].text = 'matching-passage-text';
		searchableStory.passages[1].name = 'no-match-passage-name';
		searchableStory.passages[1].text = 'no-match-passage-text';
		searchableStory.passages[1].name = '<<html>>';
		searchableStory.passages[1].text = '<<html>>';

		const unrelatedStory = fakeStoryObject(1);

		searchableStory.passages[0].name = 'matching-passage-name';
		searchableStory.passages[0].text = 'matching-passage-text';

		beforeEach(
			() =>
				(getters = bindVuexGetters(storyGetters, {
					stories: [searchableStory, unrelatedStory]
				}))
		);

		it('searches in passage text', () =>
			expect(
				getters.passagesInStoryMatchingSearch(
					searchableStory.id,
					'matching-passage-text',
					{}
				)
			).toEqual([
				{
					nameHighlighted: searchableStory.passages[0].name,
					passage: searchableStory.passages[0],
					textHighlighted: '<mark>matching-passage-text</mark>',
					textMatches: 1
				}
			]));

		it('finds matches inside words in passage text', () =>
			expect(
				getters.passagesInStoryMatchingSearch(searchableStory.id, 'atch', {})
			).toEqual([
				{
					nameHighlighted: searchableStory.passages[0].name,
					passage: searchableStory.passages[0],
					textHighlighted: 'm<mark>atch</mark>ing-passage-text',
					textMatches: 1
				}
			]));

		it('searches passage text case-insensitively by default', () =>
			expect(
				getters.passagesInStoryMatchingSearch(
					searchableStory.id,
					'MATCHING-PASSAGE-TEXT',
					{}
				)
			).toEqual([
				{
					nameHighlighted: searchableStory.passages[0].name,
					passage: searchableStory.passages[0],
					textHighlighted: '<mark>matching-passage-text</mark>',
					textMatches: 1
				}
			]));

		it('searches passage text case-sensitively if matchCase is true', () =>
			expect(
				getters.passagesInStoryMatchingSearch(
					searchableStory.id,
					'MATCHING-PASSAGE-TEXT',
					{matchCase: true}
				)
			).toEqual([]));

		it("doesn't search passage names by default", () =>
			expect(
				getters.passagesInStoryMatchingSearch(
					searchableStory.id,
					'matching-passage-name',
					{}
				)
			).toEqual([]));

		it('searches passage names if includePassageNames is true', () =>
			expect(
				getters.passagesInStoryMatchingSearch(
					searchableStory.id,
					'matching-passage-name',
					{includePassageNames: true}
				)
			).toEqual([
				{
					nameHighlighted: `<mark>${searchableStory.passages[0].name}</mark>`,
					passage: searchableStory.passages[0],
					textHighlighted: searchableStory.passages[0].text,
					textMatches: 0
				}
			]));

		it('searches passage names case-insensitively by default', () =>
			expect(
				getters.passagesInStoryMatchingSearch(
					searchableStory.id,
					'MATCHING-PASSAGE-NAME',
					{includePassageNames: true}
				)
			).toEqual([
				{
					nameHighlighted: `<mark>${searchableStory.passages[0].name}</mark>`,
					passage: searchableStory.passages[0],
					textHighlighted: searchableStory.passages[0].text,
					textMatches: 0
				}
			]));

		it('finds matches inside words in passage names', () =>
			expect(
				getters.passagesInStoryMatchingSearch(searchableStory.id, 'atch', {
					includePassageNames: true
				})
			).toEqual([
				{
					nameHighlighted: 'm<mark>atch</mark>ing-passage-name',
					passage: searchableStory.passages[0],
					textHighlighted: 'm<mark>atch</mark>ing-passage-text',
					textMatches: 1
				}
			]));

		it('searches passage names case-sensitively if matchCase is true', () =>
			expect(
				getters.passagesInStoryMatchingSearch(
					searchableStory.id,
					'MATCHING-PASSAGE-NAME',
					{includePassageNames: true, matchCase: true}
				)
			).toEqual([]));

		it('treats regexp characters as plain text by default', () =>
			expect(
				getters.passagesInStoryMatchingSearch(
					searchableStory.id,
					'matching-.*',
					{}
				)
			).toEqual([]));

		it('leaves regexp characters as-is if useRegexes is true', () =>
			expect(
				getters.passagesInStoryMatchingSearch(
					searchableStory.id,
					'matching-.*',
					{useRegexes: true}
				)
			).toEqual([
				{
					nameHighlighted: searchableStory.passages[0].name,
					passage: searchableStory.passages[0],
					textHighlighted: `<mark>${searchableStory.passages[0].text}</mark>`,
					textMatches: 1
				}
			]));

		it('highlights matches in textHighlighted', () =>
			expect(
				getters.passagesInStoryMatchingSearch(searchableStory.id, 'g', {})
			).toEqual([
				{
					nameHighlighted: 'matching-passage-name',
					passage: searchableStory.passages[0],
					textHighlighted: 'matchin<mark>g</mark>-passa<mark>g</mark>e-text',
					textMatches: 2
				}
			]));

		it('escapes pre-existing HTML in textHighlighted', () =>
			expect(
				getters.passagesInStoryMatchingSearch(searchableStory.id, 'html', {})
			).toEqual([
				{
					nameHighlighted: '&lt;&lt;html&gt;&gt;',
					passage: searchableStory.passages[1],
					textHighlighted: `&lt;&lt;<mark>html</mark>&gt;&gt;`,
					textMatches: 1
				}
			]));

		it('escapes pre-existing HTML in nameHighlighted', () =>
			expect(
				getters.passagesInStoryMatchingSearch(searchableStory.id, 'html', {
					includePassageNames: true
				})
			).toEqual([
				{
					nameHighlighted: '&lt;&lt;<mark>html</mark>&gt;&gt;',
					passage: searchableStory.passages[1],
					textHighlighted: `&lt;&lt;<mark>html</mark>&gt;&gt;`,
					textMatches: 1
				}
			]));

		it('does not alter state', () => {
			let oldSearchableStory = searchableStory;
			let oldUnrelatedStory = unrelatedStory;

			function testParams(includePassageNames, matchCase, useRegexes) {
				getters.passagesInStoryMatchingSearch(searchableStory.id, '', {
					includePassageNames,
					matchCase,
					useRegexes
				});
				expect(searchableStory).toBe(oldSearchableStory);
				expect(unrelatedStory).toBe(oldUnrelatedStory);
			}

			testParams(false, false, false);
			testParams(true, false, false);
			testParams(true, true, false);
			testParams(true, true, true);
			testParams(false, true, true);
			testParams(false, false, true);
			testParams(false, true, false);
			testParams(true, false, true);
		});

		it("returns an empty array if the story ID doesn't match any story", () =>
			expect(
				getters.passagesInStoryMatchingSearch('should not match', 'test', {})
			).toEqual([]));
	});

	describe('passageSizeDescription', () => {
		let story;
		let getters;

		beforeEach(() => {
			story = fakeStoryObject(1);
			getters = bindVuexGetters(storyGetters, {
				stories: [story]
			});
		});

		it('returns a matching size description for a passage', () => {
			Object.assign(story.passages[0], {height: 100, width: 100});
			expect(
				getters.passageSizeDescription(story.id, story.passages[0].id)
			).toBe('small');
			Object.assign(story.passages[0], {height: 200, width: 100});
			expect(
				getters.passageSizeDescription(story.id, story.passages[0].id)
			).toBe('tall');
		});

		it('returns undefined if there is no matching description', () => {
			Object.assign(story.passages[0], {height: 0, width: 0});
			expect(
				getters.passageSizeDescription(story.id, story.passages[0].id)
			).toBeUndefined();
		});

		it('returns undefined if the passage does not exist in the story', () =>
			expect(
				getters.passageSizeDescription(
					story.id,
					story.passages[0].id + 'nonexistent'
				)
			).toBeUndefined());

		it('returns undefined if the story ID does not exist', () =>
			expect(
				getters.passageSizeDescription(
					story.id + 'nonexistent',
					story.passages[0].id
				)
			).toBeUndefined());
	});

	describe('storyDimensions', () => {
		it('returns the max width and height of all passages in a story', () => {
			let story = fakeStoryObject(3);

			Object.assign(story.passages[0], {
				top: 0,
				left: 0,
				width: 100,
				height: 100
			});
			Object.assign(story.passages[1], {
				top: 20,
				left: 50,
				width: 200,
				height: 300
			});
			Object.assign(story.passages[2], {
				top: 100,
				left: 100,
				width: 5,
				height: 5
			});

			getters = bindVuexGetters(storyGetters, {
				stories: [story]
			});

			expect(getters.storyDimensions(story.id)).toEqual({
				height: 320,
				width: 250
			});
		});

		it('ignores passages with non-numeric positions and dimensions', () => {
			let story = fakeStoryObject(3);

			Object.assign(story.passages[0], {
				top: 0,
				left: 0,
				width: 150,
				height: 200
			});
			Object.assign(story.passages[1], {
				top: 'a',
				left: 0,
				width: 100,
				height: 100
			});
			Object.assign(story.passages[2], {
				top: 0,
				left: 0,
				width: 'a',
				height: 100
			});
			Object.assign(story.passages[2], {
				top: 0,
				left: 0,
				width: 100,
				height: 'a'
			});

			getters = bindVuexGetters(storyGetters, {
				stories: [story]
			});

			expect(getters.storyDimensions(story.id)).toEqual({
				height: 200,
				width: 150
			});
		});

		it('returns width and height of 0 if the story has no passages', () => {
			const story = fakeStoryObject(0);

			getters = bindVuexGetters(storyGetters, {
				stories: [story]
			});

			expect(getters.storyDimensions(story.id)).toEqual({height: 0, width: 0});
		});

		it("returns width and height of 0 if the story ID doesn't match any story", () => {
			const story = fakeStoryObject(0);

			getters = bindVuexGetters(storyGetters, {
				stories: [story]
			});

			expect(getters.storyDimensions(story.id + 'nonexistent')).toEqual({
				height: 0,
				width: 0
			});
		});

		it('does not alter state', () => {
			const stories = [fakeStoryObject(0)];
			let oldStories = stories;

			getters = bindVuexGetters(storyGetters, {stories});
			getters.storyDimensions(stories[0].id);
			expect(stories).toBe(oldStories);
		});
	});

	describe('storyLinks', () => {
		/*
		The link-parser mock thinks that every word in a passage is a link.
		*/

		it('calls linkParser() on all passages', () => {
			const stories = [fakeStoryObject(2)];

			stories[0].passages[0].text = 'a b';
			stories[0].passages[1].text = 'c d';
			getters = bindVuexGetters(storyGetters, {stories});

			expect(getters.storyLinks(stories[0].id)).toEqual({
				[stories[0].passages[0].name]: ['a', 'b'],
				[stories[0].passages[1].name]: ['c', 'd']
			});
		});

		it("doesn't include duplicate links from a single passage", () => {
			const stories = [fakeStoryObject(1)];

			stories[0].passages[0].text = 'a A';
			getters = bindVuexGetters(storyGetters, {stories});

			expect(getters.storyLinks(stories[0].id)).toEqual({
				[stories[0].passages[0].name]: ['a', 'A']
			});
		});

		it('returns an empty object if the story ID has no passages', () => {
			const stories = [fakeStoryObject(0)];

			getters = bindVuexGetters(storyGetters, {stories});
			expect(getters.storyLinks(stories[0].id)).toEqual({});
		});

		it("returns an empty object if the story ID doesn't match any story", () => {
			const stories = [fakeStoryObject(0)];

			getters = bindVuexGetters(storyGetters, {stories});
			expect(getters.storyLinks(stories[0].id + 'nonexistent')).toEqual({});
		});

		it('does not alter state', () => {
			const stories = [fakeStoryObject(1)];
			const oldStories = stories;

			getters = bindVuexGetters(storyGetters, {stories});
			getters.storyLinks(stories[0].id);
			expect(stories).toBe(oldStories);
		});
	});

	describe('storyStats', () => {
		const statStory = fakeStoryObject(1);
		const stories = [statStory, fakeStoryObject(1)];

		statStory.passages[0].text = 'a b c';

		beforeEach(
			() =>
				(getters = bindVuexGetters(storyGetters, {
					stories
				}))
		);

		it('counts characters accurately', () =>
			expect(getters.storyStats(statStory.id).characters).toBe(5));

		it('counts links using linkParser()', () =>
			expect(getters.storyStats(statStory.id).links).toBe(3));

		it('counts passages accurately', () =>
			expect(getters.storyStats(statStory.id).passages).toBe(1));

		it('counts words accurately', () =>
			expect(getters.storyStats(statStory.id).words).toBe(3));

		it("reports back the story's IFID", () =>
			expect(getters.storyStats(statStory.id).ifid).toBe(statStory.ifid));

		it("reports back the story's last update date", () =>
			expect(getters.storyStats(statStory.id).lastUpdate).toBe(
				statStory.lastUpdate
			));

		it("returns undefined values if the story ID doesn't match any story", () =>
			expect(getters.storyStats(statStory.id + 'nonexistent')).toEqual({}));

		it('does not alter state', () => {
			const oldStories = stories;

			getters.storyStats(statStory.id);
			expect(stories).toBe(oldStories);
		});
	});

	describe('storyWithId', () => {
		it('finds a story with a given ID', () => {
			expect(getters.storyWithId(stories[0].id)).toBe(stories[0]);
		});

		it('returns undefined when no stories match', () => {
			expect(getters.storyWithId('should not match')).toBeUndefined();
		});

		it('does not alter state', () => {
			let oldStories = stories;

			getters.storyWithId(stories[0].id);
			expect(stories).toBe(oldStories);
			getters.storyWithId('should not match');
			expect(stories).toBe(oldStories);
		});
	});

	describe('storyWithName', () => {
		it('finds a story with a given name', () => {
			expect(getters.storyWithName(stories[0].name)).toBe(stories[0]);
		});

		it('returns undefined when no stories match', () => {
			expect(getters.storyWithName('should not match')).toBeUndefined();
		});

		it('does not alter state', () => {
			let oldStories = stories;

			getters.storyWithName(stories[0].name);
			expect(stories).toBe(oldStories);
			getters.storyWithName('should not match');
			expect(stories).toBe(oldStories);
		});
	});
});
