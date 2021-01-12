import TextSelect from '../text-select.vue';

export default {title: 'Control/<text-select>'};

export const horizontal = () => ({
	components: {TextSelect},
	template: `<text-select :options="[{label: 'red', value: 'red'}, {label: 'green', value: 'green'}, {label: 'blue', value: 'blue'}]" orientation="horizontal" value="green">Label</text-select>`
});

export const vertical = () => ({
	components: {TextSelect},
	template: `<text-select :options="[{label: 'red', value: 'red'}, {label: 'green', value: 'green'}, {label: 'blue', value: 'blue'}]" orientation="vertical" value="blue">Label</text-select>`
});
