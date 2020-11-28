import IconButton from '../../control/icon-button';
import MainContent from '../main-content';
import TextLine from '../../control/text-line';
import TopBar from '../top-bar.vue';

export default {title: 'Container/<top-bar>'};

export const isolated = () => ({
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

export const withMainContent = () => ({
	components: {IconButton, MainContent, TextLine, TopBar},
	template: `<div>
		<top-bar back-href="javascript:void(0)" back-label="Stories">
			<template v-slot:actions>
				<icon-button icon="plus" type="create">Create Story</icon-button>
				<icon-button icon="briefcase">Archive</icon-button>
				<icon-button icon="upload">Import From File</icon-button>
				<text-line placeholder="Quick Find" />
			</template>
			<template v-slot:status>
				<em>99% space available</em>
			</template>
		</top-bar>
		<main-content>
			<h1>Hello Storybook</h1>
		</main-content>
	</div>`
});
