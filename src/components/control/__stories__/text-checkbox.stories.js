import TextCheckbox from '../text-checkbox';

export default {title: 'Control/<text-checkbox>'};

export const unchecked = () => ({
	components: {TextCheckbox},
	template: `<text-checkbox>Label</text-checkbox>`
});

export const checked = () => ({
	components: {TextCheckbox},
	template: `<text-checkbox checked>Label</text-checkbox>`
});
