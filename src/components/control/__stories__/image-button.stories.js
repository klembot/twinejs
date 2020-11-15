import {action} from '@storybook/addon-actions';
import ImageButton from '../image-button.vue';
import placeholderImage from '../../../../icons/app.svg';
import notes from './image-button.notes.md';

const computed = {
	placeholderImage() {
		return placeholderImage;
	}
};

const methods = {
	onClick: action('click')
};

export default {title: 'Control/<image-button>', parameters: {notes}};

export const normal = () => ({
	computed,
	methods,
	components: {ImageButton},
	template:
		'<image-button @click="onClick" :image="placeholderImage" label="Hello" style="width: 100px"></image-button>'
});

export const withoutShadow = () => ({
	computed,
	methods,
	components: {ImageButton},
	template:
		'<image-button @click="onClick" :image="placeholderImage" :image-shadow="false" label="Hello" style="width: 100px"></image-button>'
});
