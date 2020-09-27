import {action} from '@storybook/addon-actions';
import StoryPreview from '../story-preview';
import {fakeStoryObject} from '../../../test-utils/fakes';

const methods = {
	onClick: action('click')
};

export default {title: 'Story/<story-preview>' /*, parameters: {notes}*/};

export const empty = () => ({
	methods,
	components: {StoryPreview},
	template:
		'<story-preview @click="onClick" :hue="0" :passages="[]" style="height: 200px; width: 200px;" />'
});

export const single = () => ({
	methods,
	components: {StoryPreview},
	template:
		'<story-preview @click="onClick" :hue="0" :passages="[{name: \'Test\', left: 0, top: 0}]" style="height: 200px; width: 200px;" />'
});

export const randomHundredPassages = () => ({
	methods,
	components: {StoryPreview},
	computed: {
		passages() {
			return fakeStoryObject(100).passages;
		}
	},
	template:
		'<story-preview @click="onClick" :hue="0" :passages="passages" style="height: 200px; width: 200px;" />'
});
