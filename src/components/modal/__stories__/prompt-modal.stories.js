import PromptModal from '../prompt-modal';
import {action} from '@storybook/addon-actions';

const methods = {
	onCancel: action('cancel'),
	onSubmit: action('submit')
};

export default {title: 'Modal/<prompt-modal>'};

export const normal = () => ({
	methods: {
		onChange(v) {
			this.value = v;
		},
		...methods
	},
	components: {PromptModal},
	data() {
		return {value: ''};
	},
	template:
		'<prompt-modal @cancel="onCancel" @change="onChange" id="demo-prompt" message="What is your favorite color?" :open="true" @submit="onSubmit" :value="value" /></div>'
});
