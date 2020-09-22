import {action} from '@storybook/addon-actions';
import PassageItem from '../passage-item';
import {fakePassageObject} from '../../../test-utils/fakes';

export default {title: 'Passage/<passage-item>'};

const shared = {
	components: {PassageItem},
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
		'<passage-item @drag="dragAction" @drag-stop="dragStopAction" :passage="passage" @select-exclusive="selectExclusiveAction" @select-inclusive="selectInclusiveAction" :zoom="1" />',
	...shared
});

export const large = () => ({
	template: '<passage-item :passage="passage" :zoom="1" />',
	...shared
});

export const largeSelected = () => ({
	template: '<passage-item :passage="passage" :selected="true" :zoom="1" />',
	...shared
});

export const medium = () => ({
	template: '<passage-item :passage="passage" :zoom="0.6" />',
	...shared
});

export const mediumSelected = () => ({
	template: '<passage-item :passage="passage" :selected="true" :zoom="0.6" />',
	...shared
});

export const small = () => ({
	template: '<passage-item :passage="passage" :zoom="0.25" />',
	...shared
});

export const smallSelected = () => ({
	template: '<passage-item :passage="passage" :selected="true" :zoom="0.25" />',
	...shared
});
