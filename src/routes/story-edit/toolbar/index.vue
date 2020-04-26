<template>
	<div class="story-edit-toolbar fixed bottom">
		<raised-paper class="fill" elevation="high">
			<div class="fill justified">
				<div class="justified-start">
					<div class="stack tight">
						<icon-button @click="goHome" icon="home" type="flat" />
						<story-menu :story="story" />
					</div>
				</div>
				<div class="justified-end">
					<div class="stack">
						<div class="stack tight">
							<label>
								<span
									class="screen-reader-only"
									v-t="'storyEdit.toolbar.quickFind'"
								/>
								<text-line
									:placeholder="$t('storyEdit.toolbar.quickFind')"
									type="text"
									v-model="highlightText"
								/>
							</label>
							<icon-button
								@click="toggleFindModal"
								icon="maximize-2"
								:title="$t('storyEdit.toolbar.showFindDialog')"
								type="flat"
							/>
						</div>
						<div class="stack tight">
							<icon-button
								:active="storyZoomDescription === 'large'"
								@click="setZoom('large')"
								icon="square"
								:title="$t('storyEdit.toolbar.zoom')"
								type="flat"
							/>
							<icon-button
								:active="storyZoomDescription === 'medium'"
								@click="setZoom('medium')"
								icon="grid"
								:title="$t('storyEdit.toolbar.zoom')"
								type="flat"
							/>
							<icon-button
								:active="storyZoomDescription === 'small'"
								@click="setZoom('small')"
								icon="grid-small"
								:title="$t('storyEdit.toolbar.zoom')"
								type="flat"
							/>
						</div>
						<div class="stack tight">
							<icon-button icon="tool" label="common.test" type="flat" />
							<icon-button
								@click="playStory"
								icon="play"
								label="common.play"
								type="flat"
							/>
							<icon-button
								@click="createNewPassage"
								icon="plus"
								label="storyEdit.toolbar.addPassage"
								type="create"
							/>
						</div>
					</div>
				</div>
			</div>
		</raised-paper>
		<find-replace-modal
			@close="toggleFindModal"
			:open="findModalOpen"
			:story="story"
		/>
	</div>
</template>

<script>
import FindReplaceModal from '@/components/modal/find-replace-modal';
import IconButton from '@/components/input/icon-button';
import RaisedPaper from '@/components/surface/raised-paper';
import StoryMenu from './story-menu';
import TextLine from '@/components/input/text-line';
import {
	describe as describeZoom,
	descriptions as zoomDescriptions
} from '@/util/zoom-levels';
import openUrl from '@/util/open-url';
import '@/styles/accessibility.less';
// import './index.less';

export default {
	components: {
		FindReplaceModal,
		IconButton,
		RaisedPaper,
		StoryMenu,
		TextLine
	},
	computed: {
		storyZoomDescription() {
			return describeZoom(this.story.zoom);
		}
	},
	data() {
		return {findModalOpen: false, highlightText: ''};
	},
	methods: {
		createNewPassage() {
			this.$store.dispatch('story/createUntitledPassage', {
				centerX: window.scrollX + window.innerWidth / 2,
				centerY: window.scrollY + window.innerHeight / 2,
				storyId: this.story.id
			});
		},
		goHome() {
			this.$router.push('/stories');
		},
		playStory() {
			openUrl(`#stories/${this.story.id}/play`);
		},
		setZoom(desc) {
			if (!zoomDescriptions[desc]) {
				throw new Error(`No zoom description named "${desc}" exists.`);
			}

			this.$store.dispatch('story/updateStory', {
				storyId: this.story.id,
				storyProps: {zoom: zoomDescriptions[desc]}
			});
		},
		toggleFindModal() {
			this.findModalOpen = !this.findModalOpen;
		}
	},
	name: 'story-edit-toolbar',
	props: {
		story: {
			required: true,
			type: Object
		}
	},
	watch: {
		highlightText(value) {
			this.$store.dispatch('story/highlightPassagesWithText', {
				search: value,
				storyId: this.story.id
			});
		}
	}
};
</script>
