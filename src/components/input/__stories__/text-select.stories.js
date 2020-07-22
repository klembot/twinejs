import TextSelect from '../text-select.vue';

export default {title: 'Input/<text-select>'};

export const horizontal = () => ({
	components: {TextSelect},
	template: `<text-select :options="['red', 'green', 'blue']" orientation="horizontal" value="green">Label</text-select>`
});

export const vertical = () => ({
	components: {TextSelect},
	template: `<text-select :options="['red', 'green', 'blue']" orientation="vertical" value="blue">Label</text-select>`
});
