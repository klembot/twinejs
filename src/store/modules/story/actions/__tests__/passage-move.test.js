import {moveSelectedPassages} from '../passage-move';
import {fakeStoryObject} from '@/test-utils/fakes';

describe('moveSelectedPassages action', () => {
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
			selected: true,
			top: 10
		});
		Object.assign(story.passages[1], {
			left: 100,
			selected: false,
			name: 'Passage 2 Name',
			text: 'Passage 2 Text',
			top: 100
		});
	});

	it('moves all selected passages by an offset', () => {
		moveSelectedPassages(
			{commit, getters},
			{storyId: story.id, xChange: 1000, yChange: 100}
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
			moveSelectedPassages(
				{commit, getters},
				{storyId: story.id, xChange: 'a', yChange: 0}
			)
		).toThrow();
		expect(() =>
			moveSelectedPassages(
				{commit, getters},
				{storyId: story.id, xChange: 0, yChange: 'b'}
			)
		).toThrow();
		expect(() =>
			moveSelectedPassages(
				{commit, getters},
				{storyId: story.id, xChange: undefined, yChange: undefined}
			)
		).toThrow();
	});

	it('throws an error if there is no story with the given ID in state', () => {
		expect(() =>
			moveSelectedPassages(
				{commit, getters},
				{storyId: story.id + 'nonexistent', xChange: 0, yChange: 0}
			)
		).toThrow();
	});
});
