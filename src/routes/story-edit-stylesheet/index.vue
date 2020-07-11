<template>
	<div class="story-edit-stylesheet">
		<top-bar
			:back-route="`/stories/${this.story.id}`"
			:back-label="story.name"
		/>
		<top-content :title="$t('editors.storyStylesheet.dialogTitle')">
			<p v-t="'editors.storyStylesheet.dialogExplanation'" />
			<code-area @change="onChange" mode="css" :value="story.stylesheet" />
		</top-content>
	</div>
</template>

<script>
import CodeArea from '@/components/input/code-area';
import TopBar from '@/components/top-layout/top-bar';
import TopContent from '@/components/top-layout/top-content';
import './index.less';

export default {
	components: {CodeArea, TopBar, TopContent},
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
