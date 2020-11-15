import IconLink from '../icon-link';

export default {title: 'Control/<icon-link>'};

export const plain = () => ({
	components: {IconLink},
	template: '<icon-link icon="check" href="#" label="Hello" />'
});

export const primary = () => ({
	components: {IconLink},
	template: '<icon-link icon="check" href="#" label="Hello" type="primary" />'
});

export const create = () => ({
	components: {IconLink},
	template: '<icon-link icon="check" href="#" label="Hello" type="create" />'
});

export const danger = () => ({
	components: {IconLink},
	template: '<icon-link icon="check" href="#" label="Hello" type="danger" />'
});

export const iconOnly = () => ({
	components: {IconLink},
	template: '<icon-link href="#" icon="check" aria-label="OK" />'
});
