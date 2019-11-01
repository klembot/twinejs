import StoryFormatPicker from '../story-format-picker';
import {fakeLoadedStoryFormatObject} from '../../../test-utils';

export default {title: 'Story Format/<story-format-picker>'};

export const normal = () => ({
	components: {StoryFormatPicker},
	computed: {
		formats() {
			const result = [];

			for (let i = 0; i < 10; i++) {
				result.push(fakeLoadedStoryFormatObject());
			}

			return result;
		}
	},
	template: '<story-format-picker :formats="formats" />'
});
