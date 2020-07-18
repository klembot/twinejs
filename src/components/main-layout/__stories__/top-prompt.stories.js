import TopPrompt from '../top-prompt';
import {action} from '@storybook/addon-actions';

const methods = {
	onCancel: action('cancel'),
	onSubmit: action('submit')
};

export default {title: 'Main Layout/<top-prompt>'};

export const normal = () => ({
	methods: {
		onChange(v) {
			this.value = v;
		},
		...methods
	},
	components: {TopPrompt},
	data() {
		return {value: ''};
	},
	template:
		'<top-prompt @cancel="onCancel" @change="onChange" message="What is your favorite color?" :open="true" @submit="onSubmit" :value="value" visible />'
});
