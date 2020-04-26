import {fakeStoryObject} from '../../../../test-utils';
import {storyWithId} from '../getters';

describe('story data module getters', () => {
	describe('storyWithId', () => {
		const stories = [fakeStoryObject(), fakeStoryObject(), fakeStoryObject()];

		it('finds a story with a given ID', () => {
			expect(storyWithId({stories}, stories[0].id)).not.toBeUndefined();
		});

		it('returns undefined when no stories match', () => {});
	});
});
