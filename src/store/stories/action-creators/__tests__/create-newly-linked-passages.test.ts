import {fakeStory} from '../../../../test-util';
import {StoriesDispatch, StoriesState, Story} from '../../stories.types';
import {createNewlyLinkedPassages} from '../create-newly-linked-passages';

describe('createNewlyLinkedPassages action creator', () => {
	let dispatch: StoriesDispatch;
	let dispatchMock: jest.Mock;
	let getState: () => StoriesState;
	let story: Story;

	beforeEach(() => {
		dispatch = jest.fn();
		dispatchMock = dispatch as jest.Mock;
		story = fakeStory(1);
		getState = () => [story];
	});

	describe('The thunk it returns', () => {
		it('returns a createPassages action to create all passages', () => {
			story.passages[0].text = '';
			createNewlyLinkedPassages(
				story,
				story.passages[0],
				'[[test link]]',
				''
			)(dispatch, getState);
			expect(dispatchMock.mock.calls).toEqual([
				[
					{
						type: 'createPassages',
						props: [expect.objectContaining({name: 'test link'})],
						storyId: story.id
					}
				]
			]);
		});

		it('takes no action if no links were added', () => {
			createNewlyLinkedPassages(
				story,
				story.passages[0],
				story.passages[0].text + 'not a link',
				story.passages[0].text
			)(dispatch, getState);

			expect(dispatchMock.mock.calls).toEqual([]);
		});

		it('takes no action if the newly-linked passage already exists', () => {
			story = fakeStory(2);
			createNewlyLinkedPassages(
				story,
				story.passages[0],
				story.passages[0].text + `[[${story.passages[1].name}]]`,
				story.passages[0].text
			)(dispatch, getState);

			expect(dispatchMock.mock.calls).toEqual([]);
		});

		it('takes no action if the broken link was already present', () => {
			story.passages[0].text = '[[broken link]]';
			createNewlyLinkedPassages(
				story,
				story.passages[0],
				story.passages[0].text + 'not a link',
				story.passages[0].text
			)(dispatch, getState);

			expect(dispatchMock.mock.calls).toEqual([]);
		});

		it("throws an error if the passage doesn't belong to the story", () =>
			expect(() =>
				createNewlyLinkedPassages(
					story,
					{...story.passages[0], id: 'nonexistent'},
					story.passages[0].text,
					story.passages[0].text
				)(dispatch, getState)
			).toThrow());
	});
});
