import StoryFormatCard from '../story-format-card';
import {
	fakeFailedStoryFormatObject,
	fakeLoadedStoryFormatObject,
	fakePendingStoryFormatObject
} from '../../../test-utils/fakes';

export default {title: 'Story Format/<story-format-card>'};

export const loaded = () => ({
	components: {StoryFormatCard},
	computed: {format: fakeLoadedStoryFormatObject},
	template: '<story-format-card :format="format" />'
});

export const pending = () => ({
	components: {StoryFormatCard},
	computed: {format: fakePendingStoryFormatObject},
	template: '<story-format-card :format="format" />'
});

export const failed = () => ({
	components: {StoryFormatCard},
	computed: {format: fakeFailedStoryFormatObject},
	template: '<story-format-card :format="format" />'
});
