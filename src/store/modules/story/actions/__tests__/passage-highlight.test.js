import {highlightPassagesWithText} from '../passage-highlight';
import {actionCommits} from '@/test-utils/vuex';
import {fakeStoryObject} from '@/test-utils/fakes';

describe('highlightPassagesWithText action', () => {
	let story;
	const getters = {
		storyWithId(id) {
			if (id === story.id) {
				return story;
			}
		}
	};

	beforeEach(() => {
		story = fakeStoryObject(2);
		Object.assign(story.passages[0], {
			highlighted: false,
			name: 'Passage 1 Name',
			text: 'Passage 1 Text'
		});
		Object.assign(story.passages[1], {
			highlighted: false,
			name: 'Passage 2 Name',
			text: 'Passage 2 Text'
		});
	});

	it('highlights passages based on their text', () => {
		expect(
			actionCommits(
				highlightPassagesWithText,
				{search: 'Passage 2 Text', storyId: story.id},
				getters
			)
		).toEqual([
			[
				'updatePassage',
				{
					passageId: story.passages[1].id,
					passageProps: {highlighted: true},
					storyId: story.id
				}
			]
		]);
	});

	it('highlights passages based on their name', () => {
		expect(
			actionCommits(
				highlightPassagesWithText,
				{search: 'Passage 1 Name', storyId: story.id},
				getters
			)
		).toEqual([
			[
				'updatePassage',
				{
					passageId: story.passages[0].id,
					passageProps: {highlighted: true},
					storyId: story.id
				}
			]
		]);
	});

	it('removes highlights on non-matching passages', () => {
		story.passages.forEach(p => (p.highlighted = true));
		expect(
			actionCommits(
				highlightPassagesWithText,
				{search: 'Passage 1 Name', storyId: story.id},
				getters
			)
		).toEqual([
			[
				'updatePassage',
				{
					passageId: story.passages[1].id,
					passageProps: {highlighted: false},
					storyId: story.id
				}
			]
		]);
	});

	it('removes highlights on all passages if an empty string is passed', () => {
		story.passages[0].highlighted = true;
		expect(
			actionCommits(
				highlightPassagesWithText,
				{search: '', storyId: story.id},
				getters
			)
		).toEqual([
			[
				'updatePassage',
				{
					passageId: story.passages[0].id,
					passageProps: {highlighted: false},
					storyId: story.id
				}
			]
		]);
	});

	it('is case-insensitive', () => {
		expect(
			actionCommits(
				highlightPassagesWithText,
				{search: 'PASSAGE 1 TEXT', storyId: story.id},
				getters
			)
		).toEqual([
			[
				'updatePassage',
				{
					passageId: story.passages[0].id,
					passageProps: {highlighted: true},
					storyId: story.id
				}
			]
		]);
	});

	it('does not interpret regular expression characters', () => {
		expect(
			actionCommits(
				highlightPassagesWithText,
				{search: '.', storyId: story.id},
				getters
			)
		).toEqual([]);
	});

	it('throws an error if there is no story with the given ID in state', () => {
		expect(() =>
			actionCommits(
				highlightPassagesWithText,
				{search: '', storyId: story.id + 'nonexistent'},
				getters
			)
		).toThrow();
	});
});
