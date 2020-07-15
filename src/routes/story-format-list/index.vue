<template>
	<div class="story-format-list">
		<top-bar back-route="/" :back-label="$t('storyList.title')">
			<template v-slot:actions>
				<icon-button
					icon="plus-circle"
					label="storyFormats.addFormat"
					type="create"
				/>
			</template>
		</top-bar>
		<main-content>
			<h1 v-t="'storyFormats.storyFormats'" />
		</main-content>
	</div>
</template>

<script>
import IconButton from '@/components/input/icon-button';
import TopBar from '@/components/main-layout/top-bar';
import MainContent from '@/components/main-layout/main-content';

export default {
	components: {IconButton, MainContent, TopBar},
	name: 'story-format-list'
};
</script>
