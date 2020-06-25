<template>
	<div class="story-list">
		<story-list-top-bar />
		<top-content>
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
		</top-content>
	</div>
</template>

<script>
import StoryListItem from '@/components/story/story-list-item';
import StoryListTopBar from './top-bar';
import TopContent from '@/components/top-layout/top-content';
import './index.less';

export default {
	components: {StoryListItem, StoryListTopBar, TopContent},
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
