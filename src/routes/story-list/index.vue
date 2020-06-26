<template>
	<div class="story-list">
		<story-list-top-bar @changeSort="onChangeSort" :sort-by="sortBy" />
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
			/*
			Need to spread this to avoid mutating state.
			*/

			return [...this.$store.state.story.stories].sort((a, b) => {
				const aSort = a[this.sortBy];
				const bSort = b[this.sortBy];

				if (aSort === undefined || bSort === undefined) {
					throw new Error(
						`Story objects are missing property to sort on: ${this.sortBy}`
					);
				}

				if (aSort < bSort) {
					return this.invertSort ? 1 : -1;
				}

				if (aSort > bSort) {
					return this.invertSort ? -1 : 1;
				}

				return 0;
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
	}
};
</script>
