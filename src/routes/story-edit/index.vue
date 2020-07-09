<template>
	<div class="story-edit">
		<graph-paper />
		<passage-map
			@delete="onDeletePassage"
			@edit="onEditPassage"
			@move-selected="onMoveSelectedPassages"
			:passage-links="passageLinks"
			:passages="story.passages"
			@select-exclusive="onSelectPassageExclusive"
			@select-inclusive="onSelectPassageInclusive"
			@test="onTestPassage"
			:zoom="story.zoom"
		>
			<marquee-selection
				@select="onMarqueeSelect"
				@start-select="onMarqueeSelectStart"
		/></passage-map>
		<story-edit-top-bar :story="story" />
		<top-confirm
			@cancel="deletingPassage = null"
			@confirm="deletePassage"
			confirm-icon="trash-2"
			confirm-label="common.delete"
			confirm-type="danger"
			:message="deletePromptMessage"
			:visible="this.deletingPassage !== null"
		/>
	</div>
</template>

<script>
import GraphPaper from '@/components/surface/graph-paper';
import MarqueeSelection from '@/components/marquee-selection';
import openUrl from '@/util/open-url';
import PassageMap from './passage-map';
import StoryEditTopBar from './top-bar';
import TopConfirm from '@/components/top-layout/top-confirm';
import './index.less';

export default {
	components: {
		GraphPaper,
		MarqueeSelection,
		PassageMap,
		StoryEditTopBar,
		TopConfirm
	},
	computed: {
		deletePromptMessage() {
			if (this.deletingPassage) {
				return this.$t('storyEdit.confirmDelete', {
					passageName: this.deletingPassage.name
				});
			}

			return '';
		},
		passageLinks() {
			return this.$store.getters['story/storyLinks'](
				this.$route.params.storyId
			);
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
		deletingPassage: null,
		retainedSelectPassages: []
	}),
	methods: {
		deletePassage() {
			this.$store.dispatch('story/deletePassage', {
				passageId: this.deletingPassage.id,
				storyId: this.story.id
			});
			this.deletingPassage = null;
		},
		onDeletePassage(passage) {
			console.log('onDeletePassage');
			this.deletingPassage = passage;
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
			this.$store.dispatch('story/moveSelectedPassages', {
				xChange: xChange / this.story.zoom,
				yChange: yChange / this.story.zoom,
				storyId: this.story.id
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
			openUrl(`/stories/${this.story.id}/test/${passage.id}`);
		}
	},
	mounted() {
		if (this.story.passages.length === 0) {
			this.$store.dispatch('story/createUntitledPassage', {
				// FIXME: zoom level
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
		},
		'story.zoom': {
			handler(value, old) {
				/*
				Change the window's scroll position so that the same logical
				coordinates are at its center.
				*/

				const halfWidth = window.innerWidth / 2;
				const halfHeight = window.innerHeight / 2;
				const logCenterX = (window.scrollX + halfWidth) / old;
				const logCenterY = (window.scrollY + halfHeight) / old;

				window.scroll(
					logCenterX * value - halfWidth,
					logCenterY * value - halfHeight
				);
			}
		}
	}
};
</script>
