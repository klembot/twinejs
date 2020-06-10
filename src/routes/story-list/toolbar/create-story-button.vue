<template>
	<anchored-paper
		@click-away="togglePaper"
		position="left"
		:visible="paperOpen"
	>
		<template v-slot:anchor>
			<icon-button
				@click="togglePaper"
				icon="plus"
				label="storyList.toolbar.createStory"
				type="create"
				:title="$t('storyList.toolbar.createStoryExplanation')"
			/>
		</template>
		<template v-slot:paper>
			<div class="stack padded vertical">
				<text-line
					@change="setStoryName"
					labelPosition="vertical"
					:value="storyName"
					v-t="'storyList.toolbar.createStoryPrompt'"
				/>
				<div class="stack">
					<icon-button @click="togglePaper" icon="x" label="common.cancel" />
					<icon-button
						@click="createStory"
						icon="plus"
						label="common.create"
						type="create"
					/>
				</div>
			</div>
		</template>
	</anchored-paper>
</template>

<script>
import AnchoredPaper from '@/components/surface/anchored-paper';
import IconButton from '@/components/input/icon-button';
import TextLine from '@/components/input/text-line';
import './create-story-button.less';

export default {
	components: {AnchoredPaper, IconButton, TextLine},
	data() {
		return {paperOpen: false, storyName: ''};
	},
	methods: {
		createStory() {
			this.paperOpen = false;
			this.$store.dispatch('story/createStory', {
				storyProps: {name: this.storyName}
			});
			this.storyName = '';
		},
		setStoryName(value) {
			this.storyName = value;
		},
		togglePaper() {
			this.paperOpen = !this.paperOpen;
		}
	}
};
</script>
