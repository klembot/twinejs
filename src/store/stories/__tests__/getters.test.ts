import {storyTags} from '../getters';
import {fakeStory} from '../../../test-util/fakes';

describe('storyTags', () => {
	it('returns a sorted array of unique tags across stories', () => {
		const stories = [fakeStory(), fakeStory()];

		stories[0].tags = ['c', 'a'];
		stories[1].tags = ['a', 'b'];

		expect(storyTags(stories)).toEqual(['a', 'b', 'c']);
	});

	it('ignores stories with no tags property', () => {
		const stories = [fakeStory(), fakeStory()];

		delete (stories[0] as any).tags;
		stories[1].tags = ['a'];
		expect(storyTags(stories)).toEqual(['a']);
	});
});
