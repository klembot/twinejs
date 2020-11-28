<template>
	<div class="story-edit-stylesheet">
		<top-bar
			:back-route="`/stories/${this.story.id}`"
			:back-label="story.name"
		/>
		<main-content :title="$t('editors.storyStylesheet.dialogTitle')">
			<p v-t="'editors.storyStylesheet.dialogExplanation'" />
			<code-area
				@change="onChange"
				font="monospace"
				mode="css"
				:value="story.stylesheet"
			/>
		</main-content>
	</div>
</template>

<script>
import CodeArea from '@/components/control/code-area';
import TopBar from '@/components/container/top-bar';
import MainContent from '@/components/container/main-content';
import './index.css';

export default {
	components: {CodeArea, MainContent, TopBar},
	computed: {
		story() {
			const result = this.$store.state.story.stories.find(
				s => s.id === this.$route.params.storyId
			);

			if (!result) {
				console.warn(
					`There is no story in the data store with ID "${this.$route.params.id}".`
				);

				// TODO: show error message to user instead.
			}

			return result;
		}
	},
	methods: {
		onChange(value) {
			this.$store.dispatch('story/updateStory', {
				storyId: this.story.id,
				storyProps: {stylesheet: value}
			});
		}
	},
	name: 'story-edit-stylesheet'
};
</script>
