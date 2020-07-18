<template>
	<div class="story-edit-javascript">
		<top-bar
			:back-route="`/stories/${this.story.id}`"
			:back-label="story.name"
		/>
		<main-content :title="$t('editors.storyJavaScript.dialogTitle')">
			<h1>{{ title }}</h1>
			<p v-t="'editors.storyJavaScript.dialogExplanation'" />
			<code-area @change="onChange" mode="javascript" :value="story.script" />
		</main-content>
	</div>
</template>

<script>
import CodeArea from '@/components/input/code-area';
import MainContent from '@/components/main-layout/main-content';
import TopBar from '@/components/main-layout/top-bar';
import './index.less';

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
				storyProps: {script: value}
			});
		}
	},
	name: 'story-edit-javascript'
};
</script>
