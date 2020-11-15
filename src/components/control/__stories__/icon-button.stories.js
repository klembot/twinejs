import IconButton from '../icon-button';
import {action} from '@storybook/addon-actions';
import notes from './icon-button.notes.md';

const methods = {onClick: action('click')};

function buttonStory(type, icon, label, disabled) {
	return () => ({
		methods,
		components: {IconButton},
		template: `
			<icon-button
			@click="onClick"
			:disabled="${disabled}"
			icon="${icon}"
			type="${type}">${label}</icon-button>
		`
	});
}

export default {title: 'Control/<icon-button>', parameters: {notes}};

export const secondary = buttonStory('secondary', 'x', 'Cancel');
export const secondaryDisabled = buttonStory('secondary', 'x', 'Cancel', true);
export const primary = buttonStory('primary', 'check', 'OK');
export const primaryDisabled = buttonStory('primary', 'check', 'OK', true);
export const create = buttonStory('create', 'plus', 'Passage');
export const createDisabled = buttonStory('create', 'plus', 'Passage', true);
export const danger = buttonStory('danger', 'trash-2', 'Delete');
export const dangerDisabled = buttonStory('danger', 'trash-2', 'Delete', true);
