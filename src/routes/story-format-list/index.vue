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
		<top-content>
			<h1 v-t="'storyFormats.storyFormats'" />
		</top-content>
	</div>
</template>

<script>
import IconButton from '@/components/input/icon-button';
import TopBar from '@/components/top-layout/top-bar';
import TopContent from '@/components/top-layout/top-content';

export default {
	components: {IconButton, TopBar, TopContent},
	name: 'story-format-list'
};
</script>
