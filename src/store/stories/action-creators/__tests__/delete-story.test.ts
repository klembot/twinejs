import {deleteStory} from '../delete-story';
import {fakeStory} from '../../../../test-util';

describe('deleteStory action creator', () => {
	it('returns a deleteStory action', () => {
		const story = fakeStory();

		expect(deleteStory(story)).toEqual({
			type: 'deleteStory',
			storyId: story.id
		});
	});
});
