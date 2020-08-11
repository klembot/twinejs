import IconButton from '../icon-button';
import {action} from '@storybook/addon-actions';
import notes from './icon-button.notes.md';

const methods = {
	onClick: action('click')
};

const buttonTemplate = type =>
	`
		<div>
			<div>
			<icon-button @click="onClick" icon="check" style="margin: 10px" ${
				type ? 'type="' + type + '"' : ''
			} >Hello</icon-button>
			<icon-button :active="true" @click="onClick" icon="check" style="margin: 10px" ${
				type ? 'type="' + type + '"' : ''
			} >Hello</icon-button>
			<icon-button :disabled="true" @click="onClick" icon="check" style="margin: 10px" ${
				type ? 'type="' + type + '"' : ''
			} >Hello</icon-button>
		</div>
		<div>
			<icon-button @click="onClick" icon="check" raised style="margin: 10px" ${
				type ? 'type="' + type + '"' : ''
			} >Hello</icon-button>
			<icon-button :active="true" @click="onClick" icon="check" raised style="margin: 10px" ${
				type ? 'type="' + type + '"' : ''
			} >Hello</icon-button>
			<icon-button :disabled="true" @click="onClick" icon="check" raised style="margin: 10px" ${
				type ? 'type="' + type + '"' : ''
			} >Hello</icon-button>
		</div>
	</div>`;

const buttonPairTemplate = type =>
	`<div style="margin: 20px"><icon-button icon="x">Cancel</icon-button><icon-button icon="check" raised type="${type}">OK</icon-button></div>`;

export default {title: 'Input/<icon-button>', parameters: {notes}};

export const plain = () => ({
	methods,
	components: {IconButton},
	template: buttonTemplate()
});

export const plainSingle = () => ({
	methods,
	components: {IconButton},
	template: '<icon-button @click="onClick" icon="check">Hello</icon-button>'
});

export const primary = () => ({
	methods,
	components: {IconButton},
	template: buttonTemplate('primary')
});

export const create = () => ({
	methods,
	components: {IconButton},
	template: buttonTemplate('create')
});

export const danger = () => ({
	methods,
	components: {IconButton},
	template: buttonTemplate('danger')
});

export const iconOnly = () => ({
	methods,
	components: {IconButton},
	template: '<icon-button @click="onClick" icon="check" aria-label="OK" />'
});

export const confirmPairs = () => ({
	methods,
	components: {IconButton},
	template:
		'<div>' +
		buttonPairTemplate('primary') +
		buttonPairTemplate('create') +
		buttonPairTemplate('danger') +
		'</div>'
});
