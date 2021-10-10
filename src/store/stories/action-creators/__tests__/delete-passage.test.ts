import {Story} from '../../stories.types';
import {fakePassage, fakeStory} from '../../../../test-util';
import {deletePassage} from '../delete-passage';

describe('deletePassage action creator', () => {
	let story: Story;

	beforeEach(() => (story = fakeStory()));

	it('returns a deletePassage action', () => {
		expect(deletePassage(story, story.passages[0])).toEqual({
			type: 'deletePassage',
			passageId: story.passages[0].id,
			storyId: story.id
		});
	});

	it("throws an error if the passage doesn't belong to the story", () => {
		expect(() => deletePassage(story, fakePassage())).toThrow();
	});
});
