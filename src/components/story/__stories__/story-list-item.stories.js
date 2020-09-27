import StoryListItem from '../story-list-item';
import {fakeStoryObject} from '../../../test-utils/fakes';

export default {title: 'story/<story-list-item>'};

export const normal = () => ({
	components: {StoryListItem},
	computed: {
		story() {
			return fakeStoryObject(50);
		}
	},
	template: '<story-list-item :story="story" />'
});
