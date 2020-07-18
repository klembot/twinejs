<template>
	<div class="story-list">
		<story-list-top-bar @changeSort="onChangeSort" :sort-by="sortBy" />
		<main-content :title="title">
			<p v-if="stories.length === 0" v-t="'storyList.noStories'" />
			<div class="stories">
				<story-list-item
					v-for="story in stories"
					@edit="onEditStory"
					:key="story.id"
					:story="story"
				/>
			</div>
		</main-content>
	</div>
</template>

<script>
import sortBy from 'lodash.sortby';
import StoryListItem from '@/components/story/story-list-item';
import StoryListTopBar from './top-bar';
import MainContent from '@/components/main-layout/main-content';
import './index.less';

export default {
	components: {StoryListItem, MainContent, StoryListTopBar},
	computed: {
		stories() {
			/*
			Need to spread this to avoid mutating state.
			*/

			const result = sortBy(this.$store.state.story.stories, this.sortBy);

			if (this.invertSort) {
				result.reverse();
			}

			return result;
		},
		title() {
			return this.$tc('storyList.titleCount', this.stories.length, {
				storyCount: this.stories.length
			});
		}
	},
	data() {
		return {sortBy: 'lastUpdate', invertSort: false};
	},
	methods: {
		onEditStory(story) {
			this.$router.push(`/stories/${story.id}`);
		},
		onChangeSort(field, invertSort) {
			this.sortBy = field;
			this.invertSort = invertSort;
		}
	},
	watch: {
		title: {
			handler(value) {
				document.title = value;
			},
			immediate: true
		}
	}
};
</script>
