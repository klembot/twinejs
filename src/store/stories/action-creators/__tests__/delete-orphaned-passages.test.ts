import {fakeStory} from '../../../../test-util';
import {StoriesDispatch, StoriesState, Story} from '../../stories.types';
import {deleteOrphanedPassages} from '../delete-orphaned-passages';

describe('deleteOrphanedPassages', () => {
	let dispatch: StoriesDispatch;
	let dispatchMock: jest.Mock;
	let getState: () => StoriesState;
	let story: Story;

	beforeEach(() => {
		dispatch = jest.fn();
		dispatchMock = dispatch as jest.Mock;
		getState = () => [story];

		// Guarantee the first passage is empty.

		story = fakeStory(3);
		story.passages[0].height = 100;
		story.passages[0].text = '';
		story.passages[0].tags = [];
		story.passages[0].width = 100;
		story.passages[1].text = `[[${story.passages[0].name}]]`;

		// Guarantee it's not the start and no other links exist.
		story.startPassage = story.passages[1].id;
		story.passages[2].text = '';
	});

	it('deletes empty passages that were only linked to from the changed passage', () => {
		deleteOrphanedPassages(
			story,
			story.passages[1],
			'',
			story.passages[1].text
		)(dispatch, getState);
		expect(dispatchMock.mock.calls).toEqual([
			[
				{
					type: 'deletePassages',
					passageIds: [story.passages[0].id],
					storyId: story.id
				}
			]
		]);
	});

	it("does not delete a passage linked to from another passage, even if it's empty", () => {
		story.passages[2].text = `[[${story.passages[0].name}]]`;
		deleteOrphanedPassages(
			story,
			story.passages[1],
			'',
			story.passages[1].text
		)(dispatch, getState);
		expect(dispatchMock).not.toBeCalled();
	});

	it("does not delete a passage that isn't empty", () => {
		story.passages[0].text = 'not empty';
		deleteOrphanedPassages(
			story,
			story.passages[1],
			'',
			story.passages[1].text
		)(dispatch, getState);
		expect(dispatchMock).not.toBeCalled();
	});

	it('does not delete a passage that is the story start', () => {
		story.startPassage = story.passages[0].id;
		deleteOrphanedPassages(
			story,
			story.passages[1],
			'',
			story.passages[1].text
		)(dispatch, getState);
		expect(dispatchMock).not.toBeCalled();
	});

	it('does not delete empty passages that have no relationship to the changed passage', () => {
		story.passages[1].text = 'no link to passages[0]';
		deleteOrphanedPassages(
			story,
			story.passages[1],
			'',
			story.passages[1].text
		)(dispatch, getState);
		expect(dispatchMock).not.toBeCalled();
	});

	it('dispatches no actions if no passages are orphaned', () => {
		deleteOrphanedPassages(
			story,
			story.passages[1],
			`${story.passages[1].text} [[a new link]]`,
			story.passages[1].text
		)(dispatch, getState);
		expect(dispatchMock).not.toBeCalled();
	});

	it("throws an error if given a passage that doesn't belong to the story", () =>
		expect(() =>
			deleteOrphanedPassages(story, {...story.passages[1], id: 'bad'}, '', '')
		).toThrow());
});
