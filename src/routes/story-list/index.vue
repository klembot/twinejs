<template>
	<div class="story-list">
		<div class="stack padded vertical">
			<h1 v-t="'storyList.title'" />
			<p v-if="stories.length === 0" v-t="'storyList.noStories'" />
			<div class="stories">
				<story-list-item
					v-for="story in stories"
					@edit="onEditStory"
					:key="story.id"
					:story="story"
				/>
			</div>
		</div>
		<story-list-toolbar></story-list-toolbar>
	</div>
</template>
<script>
import StoryListItem from '@/components/story/story-list-item';
import StoryListToolbar from './toolbar';
import './index.less';

export default {
	components: {StoryListItem, StoryListToolbar},
	computed: {
		stories() {
			return this.$store.state.story.stories;
		}
	},
	methods: {
		onEditStory(story) {
			this.$router.push(`/stories/${story.id}`);
		}
	}
};
</script>
