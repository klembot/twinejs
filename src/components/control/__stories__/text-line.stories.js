import TextLine from '../text-line.vue';

export default {title: 'Control/<text-line>'};

export const horizontal = () => ({
	components: {TextLine},
	template: '<text-line orientation="horizontal">Label</text-line>'
});

export const vertical = () => ({
	components: {TextLine},
	template: '<text-line orientation="vertical">Label</text-line>'
});
