import {movePassages} from '../passage-move';
import {fakeStoryObject} from '@/test-utils/fakes';

describe('movePassages action', () => {
	let story;
	const getters = {
		storyWithId(id) {
			if (id === story.id) {
				return story;
			}
		}
	};
	let commit;

	beforeEach(() => {
		commit = jest.fn();
		story = fakeStoryObject(2);
		Object.assign(story.passages[0], {
			left: 10,
			top: 10
		});
		Object.assign(story.passages[1], {
			left: 100,
			name: 'Passage 2 Name',
			text: 'Passage 2 Text',
			top: 100
		});
	});

	it('moves all passages by an offset', () => {
		movePassages(
			{commit, getters},
			{
				passageIds: [story.passages[0].id],
				storyId: story.id,
				xChange: 1000,
				yChange: 100
			}
		);

		expect(commit).toHaveBeenCalledTimes(1);
		expect(commit).toHaveBeenCalledWith('updatePassage', {
			passageId: story.passages[0].id,
			passageProps: {left: 1010, top: 110},
			storyId: story.id
		});
	});

	it('throws an error if the offsets provided are not numbers', () => {
		expect(() =>
			movePassages(
				{commit, getters},
				{
					passageIds: [story.passages[0].id],
					storyId: story.id,
					xChange: 'a',
					yChange: 0
				}
			)
		).toThrow();
		expect(() =>
			movePassages(
				{commit, getters},
				{
					passageIds: [story.passages[0].id],
					storyId: story.id,
					xChange: 0,
					yChange: 'b'
				}
			)
		).toThrow();
		expect(() =>
			movePassages(
				{commit, getters},
				{
					passageIds: [story.passages[0].id],
					storyId: story.id,
					xChange: undefined,
					yChange: undefined
				}
			)
		).toThrow();
	});

	it('throws an error if there is no story with the given ID in state', () => {
		expect(() =>
			movePassages(
				{commit, getters},
				{
					passageIds: [story.passages[0].id],
					storyId: story.id + 'nonexistent',
					xChange: 0,
					yChange: 0
				}
			)
		).toThrow();
	});

	it('throws an error if there is no passage with the given ID in the story', () => {
		expect(() =>
			movePassages(
				{commit, getters},
				{
					passageIds: [story.passages[0].id + 'nonexistent'],
					storyId: story.id,
					xChange: 0,
					yChange: 0
				}
			)
		).toThrow();
	});
});
