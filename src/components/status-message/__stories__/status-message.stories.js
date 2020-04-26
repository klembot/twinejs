import StatusMessage from '..';
import {lorem} from 'faker';

export default {title: '<status-message>'};

const components = {StatusMessage};

const sampleContent = type =>
	`<div><status-message type="${type}">${lorem.sentences(10)}</div>`;

export const error = () => ({
	components,
	template: sampleContent('error')
});

export const info = () => ({
	components,
	template: sampleContent('info')
});

export const success = () => ({
	components,
	template: sampleContent('success')
});

export const warning = () => ({
	components,
	template: sampleContent('warning')
});
