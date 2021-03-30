import {Story, StoriesDispatch} from '../../stories.types';
import {updatePassage} from '../update-passage';
import {fakeStory} from '../../../../test-util/fakes';
import {createNewlyLinkedPassages} from '../create-newly-linked-passages';

jest.mock('../create-newly-linked-passages');

describe('updatePassage', () => {
	const createNewlyLinkedPassagesMock = createNewlyLinkedPassages as jest.Mock;
	let dispatch: StoriesDispatch;
	let dispatchMock: jest.Mock;
	let story: Story;

	beforeEach(() => {
		dispatch = jest.fn();
		dispatchMock = dispatch as jest.Mock;
		story = fakeStory(1);
	});

	it('calls dispatch with an updateStory action type', () => {
		updatePassage(dispatch, story, story.passages[0], {name: 'test name'});
		expect(dispatchMock.mock.calls).toEqual([
			[
				{
					passageId: story.passages[0].id,
					props: {name: 'test name'},
					storyId: story.id,
					type: 'updatePassage',
				},
			],
		]);
	});

	it("throws an error if the passage doesn't belong to the story", () =>
		expect(() =>
			updatePassage(
				dispatch,
				story,
				{...story.passages[0], id: 'nonexistent'},
				{name: 'test name'}
			)
		).toThrow());

	it('throws an error if the passage is being renamed to a name that already exists', () => {
		story = fakeStory(2);

		expect(() =>
			updatePassage(dispatch, story, story.passages[0], {
				name: story.passages[1].name,
			})
		).toThrow();
	});

	it('calls createNewlyLinkedPassages when text is changed', () => {
		const oldText = story.passages[0].text;

		updatePassage(dispatch, story, story.passages[0], {text: 'new text'});
		expect(createNewlyLinkedPassagesMock.mock.calls).toEqual([
			[dispatch, story, story.passages[0], 'new text', oldText],
		]);
	});

	it("doesn't call createNewlyLinkedPassages if text isn't being changed", () => {
		updatePassage(dispatch, story, story.passages[0], {name: 'new name'});
		expect(createNewlyLinkedPassagesMock.mock.calls).toEqual([]);
	});

	it("doesn't call createNewlyLinkedPassages if the dontCreateNewlyLinkedPassages option is true", () => {
		updatePassage(
			dispatch,
			story,
			story.passages[0],
			{text: 'new text'},
			{dontCreateNewlyLinkedPassages: true}
		);
		expect(createNewlyLinkedPassagesMock.mock.calls).toEqual([]);
	});
});
