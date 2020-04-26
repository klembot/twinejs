import TextLine from '../text-line.vue';

export default {title: 'Input/<text-line>'};

export const sideLabel = () => ({
	components: {TextLine},
	template: '<text-line label-position="side">Label</text-line>'
});

export const labelAbove = () => ({
	components: {TextLine},
	template: '<text-line label-position="above">Label</text-line>'
});
