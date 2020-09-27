import StoryFormatItem from '../story-format-item';
import {
	fakeFailedStoryFormatObject,
	fakeLoadedStoryFormatObject,
	fakePendingStoryFormatObject
} from '../../../test-utils/fakes';

export default {title: 'Story Format/<story-format-item>'};

export const loaded = () => ({
	components: {StoryFormatItem},
	computed: {format: fakeLoadedStoryFormatObject},
	template: '<story-format-item :format="format" />'
});

export const pending = () => ({
	components: {StoryFormatItem},
	computed: {format: fakePendingStoryFormatObject},
	template: '<story-format-item :format="format" />'
});

export const failed = () => ({
	components: {StoryFormatItem},
	computed: {format: fakeFailedStoryFormatObject},
	template: '<story-format-item :format="format" />'
});
