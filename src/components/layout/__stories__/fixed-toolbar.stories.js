import FixedToolbar from '../fixed-toolbar.vue';
import IconButton from '../../form/icon-button.vue';

export default {title: '<fixed-toolbar>'};

const components = {FixedToolbar, IconButton};

function sampleContent(position) {
	return `
		<fixed-toolbar position="${position}">
			<template v-slot:start>
				<icon-button label="First" type="create"></icon-button>
				<icon-button label="Second" type="danger"></icon-button>
				<icon-button label="Third"></icon-button>
			</template>
			<template v-slot:middle>
				<icon-button label="First" type="create"></icon-button>
				<icon-button label="Second" type="danger"></icon-button>
				<icon-button label="Third"></icon-button>
			</template>
			<template v-slot:end>
				<icon-button label="First" type="create"></icon-button>
				<icon-button label="Second" type="danger"></icon-button>
				<icon-button label="Third"></icon-button>
			</template>
		</fixed-toolbar>
	`;
}

export const left = () => ({
	components,
	template: sampleContent('left')
});

export const right = () => ({
	components,
	template: sampleContent('right')
});

export const top = () => ({
	components,
	template: sampleContent('top')
});

export const bottom = () => ({
	components,
	template: sampleContent('bottom')
});
