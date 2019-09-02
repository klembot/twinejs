import {action} from '@storybook/addon-actions';
import IconButton from '../icon-button.vue';
import {library} from '@fortawesome/fontawesome-svg-core';
import {faCheck} from '@fortawesome/free-solid-svg-icons';

library.add(faCheck);

import notes from './icon-button.notes.md';

const methods = {
	onClick: action('click')
};

export default {title: '<icon-button>', parameters: {notes}};

export const plain = () => ({
	methods,
	components: {IconButton},
	template:
		'<icon-button @click="onClick" icon="check" label="Hello"></icon-button>'
});

export const primary = () => ({
	methods,
	components: {IconButton},
	template:
		'<icon-button @click="onClick" icon="check" label="Hello" type="primary"></icon-button>'
});

export const create = () => ({
	methods,
	components: {IconButton},
	template:
		'<icon-button @click="onClick" icon="check" label="Hello" type="create"></icon-button>'
});

export const danger = () => ({
	methods,
	components: {IconButton},
	template:
		'<icon-button @click="onClick" icon="check" label="Hello" type="danger"></icon-button>'
});

export const iconOnly = () => ({
	methods,
	components: {IconButton},
	template:
		'<icon-button @click="onClick" icon="check" aria-label="OK"></icon-button>'
});
