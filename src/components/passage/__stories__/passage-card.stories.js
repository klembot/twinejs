import {action} from '@storybook/addon-actions';
import PassageCard from '../passage-card';
import {fakePassageObject} from '../../../test-utils/fakes';

export default {title: 'Passage/<passage-card>'};

const shared = {
	components: {PassageCard},
	computed: {
		passage() {
			return fakePassageObject({top: 20, left: 20});
		}
	},
	methods: {
		dragAction: action('drag'),
		dragStopAction: action('drag-stop'),
		selectExclusiveAction: action('select-exclusive'),
		selectInclusiveAction: action('select-inclusive')
	}
};

export const eventDemo = () => ({
	template:
		'<passage-card @drag="dragAction" @drag-stop="dragStopAction" :passage="passage" @select-exclusive="selectExclusiveAction" @select-inclusive="selectInclusiveAction" :zoom="1" />',
	...shared
});

export const large = () => ({
	template: '<passage-card :passage="passage" :zoom="1" />',
	...shared
});

export const largeSelected = () => ({
	template: '<passage-card :passage="passage" :selected="true" :zoom="1" />',
	...shared
});

export const medium = () => ({
	template: '<passage-card :passage="passage" :zoom="0.6" />',
	...shared
});

export const mediumSelected = () => ({
	template: '<passage-card :passage="passage" :selected="true" :zoom="0.6" />',
	...shared
});

export const small = () => ({
	template: '<passage-card :passage="passage" :zoom="0.25" />',
	...shared
});

export const smallSelected = () => ({
	template: '<passage-card :passage="passage" :selected="true" :zoom="0.25" />',
	...shared
});
