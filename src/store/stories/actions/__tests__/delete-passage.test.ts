import {Story, StoriesDispatch} from '../../stories.types';
import {fakePassage, fakeStory} from '../../../../test-util/fakes';
import {deletePassage} from '../delete-passage';

describe('deletePassage', () => {
	let dispatch: StoriesDispatch;
	let dispatchMock: jest.Mock;
	let story: Story;

	beforeEach(() => {
		dispatch = jest.fn();
		dispatchMock = dispatch as jest.Mock;
		story = fakeStory();
	});

	it('dispatches a deletePassage action', () => {
		deletePassage(dispatch, story, story.passages[0]);
		expect(dispatchMock.mock.calls).toEqual([
			[
				{
					type: 'deletePassage',
					passageId: story.passages[0].id,
					storyId: story.id
				}
			]
		]);
	});

	it("throws an error if the passage doesn't belong to the story", () => {
		expect(() => deletePassage(dispatch, story, fakePassage())).toThrow();
	});
});
