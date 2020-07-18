import IconButton from '../../input/icon-button.vue';
import TopBar from '../top-bar.vue';
import TopDialog from '../top-dialog.vue';

export default {title: 'Main Layout/<top-dialog>'};

export const normal = () => ({
	components: {TopDialog},
	template: `<top-dialog visible>
		<template v-slot:content><p>This is a dialog.</p></template>
	</top-dialog>`
});

export const withActions = () => ({
	components: {IconButton, TopBar, TopDialog},
	template: `<div>
		<top-bar back-label="Back" />
		<top-dialog visible>
			<template v-slot:content><p>This is a dialog.</p></template>
			<template v-slot:actions>
				<icon-button icon="check" raised>Cancel</icon-button>
				<icon-button icon="check" raised type="primary">OK</icon-button>
			</template>
		</top-dialog>
	</div>`
});

export const withTopBar = () => ({
	components: {TopBar, TopDialog},
	template: `<div>
		<top-bar back-label="Back" />
		<top-dialog visible><template v-slot:content><p>This is a dialog.</p></template></top-dialog>
	</div>`
});
