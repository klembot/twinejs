<template>
	<div class="story-edit">
		<story-edit-top-bar @create-passage="onCreatePassage" :story="story" />
		<delete-passage-modal
			@cancel="onCancelDeletePassages"
			@confirm="onConfirmDeletePassages"
			:passages="deletingPassages ? selectedPassages : []"
		/>
		<main-content :padded="false" mouse-scrolling ref="mainContent">
			<div class="container" :style="containerStyle">
				<graph-paper :zoom="apparentZoom" />
				<marquee-selection
					@select="onMarqueeSelect"
					@start-select="onMarqueeSelectStart"
				/>
				<passage-toolbar
					@delete="onDeletePassages"
					@edit="onEditPassage"
					:passages="selectedPassages"
					@test="onTestPassage"
					:zoom="apparentZoom"
				/>
				<passage-map
					@deselect="onDeselectPassage"
					@edit="onEditPassage"
					@move-selected="onMoveSelectedPassages"
					:passage-links="passageLinks"
					:passages="story.passages"
					@select-exclusive="onSelectPassageExclusive"
					@select-inclusive="onSelectPassageInclusive"
					:tagColors="story.tagColors"
					:zoom="apparentZoom"
				>
				</passage-map>
			</div>
		</main-content>
	</div>
</template>

<script>
import DeletePassageModal from './delete-passage-modal';
import GraphPaper from '@/components/surface/graph-paper';
import launchStory from '@/util/launch-story';
import MarqueeSelection from '@/components/marquee-selection';
import MainContent from '@/components/container/main-content';
import PassageToolbar from '@/components/passage/passage-toolbar';
import PassageMap from './passage-map';
import StoryEditTopBar from './top-bar';
import zoomTransitions from './zoom-transitions';
import './index.css';

export default {
	components: {
		DeletePassageModal,
		GraphPaper,
		MainContent,
		MarqueeSelection,
		PassageToolbar,
		PassageMap,
		StoryEditTopBar
	},
	computed: {
		containerStyle() {
			const {height, width} = this.$store.getters['story/storyDimensions'](
				this.$route.params.storyId
			);

			return {
				height:
					Math.max(height, window.innerHeight) + window.innerHeight / 2 + 'px',
				width: Math.max(width, window.innerWidth) + window.innerWidth / 2 + 'px'
			};
		},
		passageLinks() {
			return this.$store.getters['story/storyLinks'](
				this.$route.params.storyId
			);
		},
		selectedPassages() {
			return this.story.passages.filter(p => p.selected);
		},
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
	data: () => ({
		deletingPassages: false,
		retainedSelectPassages: []
	}),
	methods: {
		onCancelDeletePassages() {
			this.deletingPassages = false;
		},
		onConfirmDeletePassages() {
			this.$store.dispatch('story/deletePassages', {
				passageIds: this.selectedPassages.map(p => p.id),
				storyId: this.story.id
			});
			this.deletingPassages = false;
		},
		onCreatePassage() {
			const mainContentEl = this.$refs.mainContent.$el;

			this.$store.dispatch('story/createUntitledPassage', {
				centerX:
					(mainContentEl.scrollLeft + mainContentEl.clientWidth / 2) /
					this.story.zoom,
				centerY:
					(mainContentEl.scrollTop + mainContentEl.clientHeight / 2) /
					this.story.zoom,
				storyId: this.story.id
			});
		},
		onDeletePassages() {
			this.deletingPassages = true;
		},
		onDeselectPassage(passage) {
			this.$store.dispatch('story/deselectPassage', {
				passageId: passage.id,
				storyId: this.story.id
			});
		},
		onEditPassage(passage) {
			this.$router.push(`/stories/${this.story.id}/passage/${passage.id}`);
		},
		onMarqueeSelect({height, left, top, width}) {
			this.$store.dispatch('story/selectPassagesInRect', {
				height: height / this.story.zoom,
				ignore: this.retainedSelectedPassages,
				left: left / this.story.zoom,
				storyId: this.story.id,
				top: top / this.story.zoom,
				width: width / this.story.zoom
			});
		},
		onMarqueeSelectStart(additive) {
			/* Remember passages that started selected if this is additive. */

			if (additive) {
				this.retainedSelectedPassages = this.story.passages.filter(
					p => p.selected
				);
			} else {
				this.retainedSelectedPassages = [];
			}
		},
		onMoveSelectedPassages(xChange, yChange) {
			this.$store.dispatch('story/movePassages', {
				passageIds: this.selectedPassages.map(p => p.id),
				storyId: this.story.id,
				xChange: xChange / this.story.zoom,
				yChange: yChange / this.story.zoom
			});
		},
		onSelectPassageExclusive(passage) {
			this.$store.dispatch('story/selectPassage', {
				exclusive: true,
				passageId: passage.id,
				storyId: this.story.id
			});
		},
		onSelectPassageInclusive(passage) {
			this.$store.dispatch('story/selectPassage', {
				exclusive: false,
				passageId: passage.id,
				storyId: this.story.id
			});
		},
		onTestPassage(passage) {
			launchStory(this.$store, this.story.id, {
				startPassage: passage.id,
				test: true
			});
		}
	},
	mixins: [zoomTransitions],
	mounted() {
		/*
		Because we aren't using <main-content>, we have to set the title ourselves.
		*/

		document.title = this.story.name;

		/*
		Automatically create the first passage.
		*/

		if (this.story.passages.length === 0) {
			this.$store.dispatch('story/createUntitledPassage', {
				// FIXME: zoom level
				// FIXME needs to refer to $refs.mainContent$e.l
				centerX: window.scrollX + window.innerWidth / 2,
				centerY: window.scrollY + window.innerHeight / 2,
				storyId: this.story.id
			});
		}
	},
	watch: {
		'story.name': {
			handler(value) {
				document.title = value;
			},
			immediate: true
		}
	}
};
</script>
