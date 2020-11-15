import StoryCard from '../story-card';
import {fakeStoryObject} from '../../../test-utils/fakes';

export default {title: 'story/<story-list-item>'};

export const normal = () => ({
	components: {StoryCard},
	computed: {
		story() {
			return fakeStoryObject(50);
		}
	},
	template: '<story-card :story="story" />'
});
