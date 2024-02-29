import {
	passageWithId,
	passageWithName,
	storyPassageTags,
	storyWithId,
	storyWithName,
	storyTags,
	passagesMatchingSearch,
	passagesMatchingFuzzySearch,
	passageTagFrequencies,
	storyTagFrequencies
} from '../getters';
import {Passage, Story} from '../stories.types';
import {fakePassage, fakeStory} from '../../../test-util';
import {passageConnections} from '..';

describe('passageConnections()', () => {
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

describe('passagesMatchingFuzzySearch', () => {
	let passages: Passage[];

	beforeEach(
		() =>
			(passages = [
				fakePassage({name: 'A name', text: 'A text'}),
				fakePassage({name: 'B name', text: 'B text'}),
				fakePassage({name: 'C name', text: 'C text'}),
				fakePassage({name: 'D name', text: 'D text'}),
				fakePassage({name: 'bad', text: 'bad'}),
				fakePassage({name: 'bad', text: 'bad'}),
				fakePassage({name: 'bad', text: 'bad'}),
				fakePassage({name: 'E name', text: 'E text'})
			])
	);

	it('returns the top five results matching a search by default', () => {
		expect(passagesMatchingFuzzySearch(passages, 'txet')).toEqual([
			passages[0],
			passages[1],
			passages[2],
			passages[3],
			passages[7]
		]);
	});

	it('limits search results to the count specified', () => {
		expect(passagesMatchingFuzzySearch(passages, 'txet', 1)).toEqual([
			passages[0]
		]);
	});

	it('returns an empty array if no passages match', () => {
		expect(passagesMatchingFuzzySearch(passages, 'nonexistent', 1)).toEqual([]);
	});
});

describe('passagesMatchingSearch()', () => {
	let passages: Passage[];

	beforeEach(
		() =>
			(passages = [
				fakePassage({name: 'A name', text: 'A text'}),
				fakePassage({name: 'B name', text: 'B text'}),
				fakePassage({name: 'C name', text: 'C text'})
			])
	);

	it('returns passages matching a search', () => {
		expect(passagesMatchingSearch(passages, 'a', {})).toEqual([passages[0]]);
		expect(passagesMatchingSearch(passages, 'a.*', {useRegexes: true})).toEqual(
			[passages[0]]
		);
		expect(
			passagesMatchingSearch(passages, 'b text', {includePassageNames: true})
		).toEqual([passages[1]]);
		expect(
			passagesMatchingSearch(passages, 'C text', {matchCase: true})
		).toEqual([passages[2]]);
	});

	it('returns an empty array if no passages match the search', () =>
		expect(passagesMatchingSearch(passages, 'd', {})).toEqual([]));

	it('returns an empty array if the regexp flag is set but the search is an invalid regexp', () =>
		expect(passagesMatchingSearch(passages, 'a(', {useRegexes: true})).toEqual(
			[]
		));
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

describe('passageTagFrequencies()', () => {
	it('returns an object with correct counts of frequencies of tags across all passages in a story', () =>{
		const story = fakeStory(3);
		story.passages[0].tags = ['tag1', 'tag2'];
		story.passages[1].tags = ['tag2', 'tag3'];
		story.passages[2].tags = ['tag1'];

		const expectedTagFrequencies ={
			tag1: 2,
			tag2: 2,
			tag3: 1,
		};

	   expect(passageTagFrequencies(story)).toEqual(expectedTagFrequencies);
	});

	it('returns empty object if no tags present', () => {
		const story = fakeStory(2);
		const expectedTagFrequencies ={};

		expect(passageTagFrequencies(story)).toEqual(expectedTagFrequencies);
	})

});

describe('storyTagFrequencies()', () => {
	it('returns correct frequencies of tags of all stories', () => {
		const stories = [fakeStory(), fakeStory()];

		stories[0].tags = ['c', 'a'];
		stories[1].tags = ['a', 'b'];

		const expectedStoryTagFrequencies ={
			a: 2,
			b: 1,
			c: 1,
		};

		expect(storyTagFrequencies(stories)).toEqual(expectedStoryTagFrequencies);
	});

	it('returns empty object with no tags', () => {
		const stories = [fakeStory(), fakeStory()];
		const expectedStoryTagFrequencies = {};

		expect(storyTagFrequencies(stories)).toEqual(expectedStoryTagFrequencies);
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
