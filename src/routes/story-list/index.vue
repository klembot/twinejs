<template>
	<div class="story-list">
		<story-list-top-bar @changeSort="onChangeSort" :sort-by="sortBy" />
		<main-content :title="title">
			<p v-if="stories.length === 0" v-t="'storyList.noStories'" />
			<card-group column-width="450px">
				<story-card
					v-for="story in stories"
					@edit="onEditStory"
					:key="story.id"
					@play="onPlayStory"
					@publish="onPublishStory"
					:story="story"
					@test="onTestStory"
				/>
			</card-group>
		</main-content>
	</div>
</template>

<script>
import sortBy from 'lodash.sortby';
import CardGroup from '@/components/container/card-group';
import launchStory from '@/util/launch-story';
import StoryCard from '@/components/story/story-card';
import StoryListTopBar from './top-bar';
import MainContent from '@/components/container/main-content';
import {publishStory} from '@/store/publish';
import saveHtml from '@/util/save-html';
import {storyFilename} from '@/util/publish';

export default {
	components: {
		CardGroup,
		StoryCard,
		MainContent,
		StoryListTopBar
	},
	computed: {
		stories() {
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
		onChangeSort(field, invertSort) {
			this.sortBy = field;
			this.invertSort = invertSort;
		},
		onEditStory(story) {
			this.$router.push(`/stories/${story.id}`);
		},
		onPlayStory(story) {
			launchStory(this.$store, story.id);
		},
		async onPublishStory(story) {
			try {
				saveHtml(
					await publishStory(this.$store, story.id),
					storyFilename(story)
				);
			} catch (e) {
				/* TODO: better error notification */
				console.warn(e);
			}
		},
		onTestStory(story) {
			launchStory(this.$store, story.id, {test: true});
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
