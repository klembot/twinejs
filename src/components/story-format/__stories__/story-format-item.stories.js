import StoryFormatItem from '../story-format-item';
import {fakeLoadedStoryFormatObject} from '../../../test-utils';

export default {title: 'Story Format/<story-format-item>'};

export const normal = () => ({
	components: {StoryFormatItem},
	computed: {format: fakeLoadedStoryFormatObject},
	template: '<story-format-item :format="format" />'
});
