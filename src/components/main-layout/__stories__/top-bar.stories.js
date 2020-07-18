import IconButton from '../../input/icon-button';
import TextLine from '../../input/text-line';
import TopBar from '../top-bar.vue';

export default {title: 'Main Layout/<top-bar>'};

export const normal = () => ({
	components: {IconButton, TextLine, TopBar},
	template: `<top-bar back-href="javascript:void(0)" back-label="Stories">
		<template v-slot:actions>
			<icon-button icon="plus" type="create">Create Story</icon-button>
			<icon-button icon="briefcase">Archive</icon-button>
			<icon-button icon="upload">Import From File</icon-button>
			<text-line placeholder="Quick Find" />
		</template>
		<template v-slot:status>
			<em>99% space available</em>
		</template>
	</top-bar>`
});
