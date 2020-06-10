<template>
	<div class="story-menu">
		<anchored-paper
			@click-away="toggleMenuVisible"
			position="top"
			:visible="menuVisible"
		>
			<template v-slot:anchor>
				<icon-button
					@click="toggleMenuVisible"
					icon="chevron-up"
					icon-position="end"
					type="flat"
					>{{ story.name }}</icon-button
				>
			</template>
			<template v-slot:paper
				><div class="stack vertical tight">
					<icon-button
						@click="toggleJavaScriptEditor"
						icon="code"
						label="storyEdit.storyMenu.editJavaScript"
						type="flat"
					/>
					<icon-button
						@click="toggleStylesheetEditor"
						icon="hash"
						label="storyEdit.storyMenu.editStylesheet"
						type="flat"
					/>
					<icon-button
						icon="file-text"
						label="storyEdit.storyMenu.setStoryFormat"
						type="flat"
					/>
					<icon-button
						@click="toggleRenameModal"
						icon="type"
						label="storyEdit.storyMenu.renameStory"
						type="flat"
					/>
					<icon-button
						@click="selectAllPassages"
						icon="layers"
						label="storyEdit.storyMenu.selectAllPassages"
						type="flat"
					/>
					<icon-button
						@click="toggleSnapToGrid"
						icon="empty"
						label="storyEdit.storyMenu.snapToGrid"
						type="flat"
					/>
					<icon-button
						icon="bar-chart-2"
						@click="toggleStatsModal"
						label="storyEdit.storyMenu.storyStats"
						type="flat"
					/>
					<icon-button
						@click="proofStory"
						icon="book-open"
						label="storyEdit.storyMenu.proofStory"
						type="flat"
					/>
					<icon-button
						icon="download"
						label="common.publishToFile"
						type="flat"
					/></div
			></template>
		</anchored-paper>
		<javascript-editor
			@close="toggleJavaScriptEditor"
			@edit="setStoryJavaScript"
			:id="`javascript-editor-${this.story.id}`"
			:open="javaScriptEditorOpen"
			:story="story"
		/>
		<prompt-modal
			@cancel="toggleRenameModal"
			:id="`prompt-modal-${this.story.id}`"
			:message="
				$t({
					path: 'storyEdit.storyMenu.renameStoryPrompt',
					args: {name: this.story.name}
				})
			"
			:open="renameModalOpen"
			@submit="renameStory"
			submitLabel="Rename"
		/>
		<story-stats-modal
			:brokenLinks="storyStats.brokenLinks"
			:characters="storyStats.characters"
			@close="toggleStatsModal"
			:ifid="storyStats.ifid"
			:id="`story-stats-modal-${this.story.id}`"
			:last-update="storyStats.lastUpdate"
			:links="storyStats.links"
			:open="statsModalOpen"
			:passages="storyStats.passages"
			:words="storyStats.words"
		/>
		<stylesheet-editor
			@close="toggleStylesheetEditor"
			@edit="setStoryStylesheet"
			:id="`stylesheet-editor-${this.story.id}`"
			:open="stylesheetEditorOpen"
			:story="story"
		/>
	</div>
</template>
<script>
import AnchoredPaper from '@/components/surface/anchored-paper';
import IconButton from '@/components/input/icon-button';
import JavaScriptEditor from '@/components/modal/javascript-editor';
import openUrl from '@/util/open-url';
import PromptModal from '@/components/modal/prompt-modal';
import StoryStatsModal from '@/components/modal/story-stats-modal';
import StylesheetEditor from '@/components/modal/stylesheet-editor';

export default {
	components: {
		AnchoredPaper,
		IconButton,
		'javascript-editor': JavaScriptEditor,
		PromptModal,
		StoryStatsModal,
		StylesheetEditor
	},
	data: () => ({
		javaScriptEditorOpen: false,
		menuVisible: false,
		renameModalOpen: false,
		statsModalOpen: false,
		storyStats: {
			brokenLinks: 0,
			characters: 0,
			ifid: '',
			lastUpdate: new Date(),
			links: 0,
			passages: 0,
			words: 0
		},
		stylesheetEditorOpen: false
	}),
	methods: {
		proofStory() {
			openUrl(`#stories/${this.story.id}/proof`);
		},
		renameStory(value) {
			this.$store.dispatch('story/updateStory', {
				storyId: this.story.id,
				storyProps: {name: value}
			});
			this.toggleRenameModal();
		},
		selectAllPassages() {
			this.$store.dispatch('story/selectAllPassages', {
				storyId: this.story.id
			});
		},
		setStoryJavaScript(value) {
			this.$store.dispatch('story/updateStory', {
				storyId: this.story.id,
				storyProps: {script: value}
			});
		},
		setStoryStylesheet(value) {
			this.$store.dispatch('story/updateStory', {
				storyId: this.story.id,
				storyProps: {stylesheet: value}
			});
		},
		toggleMenuVisible() {
			this.menuVisible = !this.menuVisible;
		},
		toggleJavaScriptEditor() {
			this.javaScriptEditorOpen = !this.javaScriptEditorOpen;
		},
		toggleRenameModal() {
			this.renameModalOpen = !this.renameModalOpen;
		},
		toggleSnapToGrid() {
			this.$store.dispatch('story/updateStory', {
				storyId: this.story.id,
				storyProps: {snapToGrid: !this.story.snapToGrid}
			});
		},
		toggleStatsModal() {
			/*
			Recalculate stats right before we show the dialog.
			*/

			if (!this.statsModalOpen) {
				console.log(this.$store.getters);
				this.storyStats = this.$store.getters['story/storyStats'](
					this.story.id
				);
			}

			this.statsModalOpen = !this.statsModalOpen;
		},
		toggleStylesheetEditor() {
			this.stylesheetEditorOpen = !this.stylesheetEditorOpen;
		}
	},
	name: 'story-menu',
	props: {
		story: {
			required: true,
			type: Object
		}
	}
};
</script>
