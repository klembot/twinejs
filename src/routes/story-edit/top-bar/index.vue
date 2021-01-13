<template>
	<div class="story-edit-top-bar">
		<top-bar back-route="/" :back-label="$t('storyList.title')">
			<template v-slot:actions>
				<icon-button
					@click="createPassage"
					icon="plus-circle"
					label="storyEdit.topBar.addPassage"
					type="create"
				/>
				<icon-button
					@click="zoomIn"
					icon="zoom-in"
					label="storyEdit.topBar.zoomIn"
				/>
				<icon-button
					@click="zoomOut"
					icon="zoom-out"
					label="storyEdit.topBar.zoomOut"
				/>
				<icon-button @click="testStory" icon="tool" label="common.test" />
				<icon-button @click="playStory" icon="play" label="common.play" />
				<dropdown-button icon="more-horizontal" label="common.more">
					<icon-button
						@click="editJavaScript"
						icon="code"
						label="storyEdit.topBar.editJavaScript"
					/>
					<icon-button
						@click="editStylesheet"
						icon="hash"
						label="storyEdit.topBar.editStylesheet"
					/>
					<icon-button
						@click="toggleFormatSelect"
						icon="file-text"
						label="storyEdit.topBar.setStoryFormat"
					/>
					<icon-button
						@click="toggleRenamePrompt"
						icon="type"
						label="storyEdit.topBar.renameStory"
					/>
					<icon-button
						@click="selectAllPassages"
						icon="layers"
						label="storyEdit.topBar.selectAllPassages"
					/>
					<icon-button
						@click="findAndReplace"
						icon="search"
						label="storyEdit.topBar.findAndReplace"
					/>
					<icon-button
						@click="toggleSnapToGrid"
						:icon="story.snapToGrid ? 'check' : 'empty'"
						label="storyEdit.topBar.snapToGrid"
					/>
					<icon-button
						icon="bar-chart-2"
						@click="showStoryStats"
						label="storyEdit.topBar.storyStats"
					/>
					<icon-button
						@click="proofStory"
						icon="book-open"
						label="storyEdit.topBar.proofStory"
					/>
					<icon-button icon="download" label="common.publishToFile" />
				</dropdown-button>
				<text-line placeholder="Quick Find" type="search" />
			</template>
		</top-bar>
		<select-modal
			@cancel="toggleFormatSelect"
			:defaultValue="formatId"
			:loadingMessage="
				formatLoadPercent === 1
					? undefined
					: $t('storyEdit.topBar.loadingFormats')
			"
			:message="$t('storyEdit.topBar.setStoryFormatPrompt')"
			:options="formatOptions"
			@submit="setStoryFormat"
			:value="formatId"
			:visible="showFormatSelect"
		/>
		<prompt-modal
			@cancel="toggleRenamePrompt"
			:message="$t('storyEdit.topBar.renameStoryPrompt', {name: story.name})"
			@submit="renameStory"
			:visible="showRenamePrompt"
		/>
	</div>
</template>

<script>
import DropdownButton from '@/components/control/dropdown-button';
import IconButton from '@/components/control/icon-button';
import launchStory from '@/util/launch-story';
import PromptModal from '@/components/modal/prompt-modal';
import SelectModal from '@/components/modal/select-modal';
import TextLine from '@/components/control/text-line';
import TopBar from '@/components/container/top-bar';
import '@/styles/accessibility.css';

export default {
	components: {
		DropdownButton,
		IconButton,
		PromptModal,
		SelectModal,
		TextLine,
		TopBar
	},
	computed: {
		allStoryFormats() {
			return this.$store.getters['storyFormat/allStoryFormats'];
		},
		formatLoadPercent() {
			return this.$store.getters['storyFormat/formatLoadPercent'];
		},
		formatOptions() {
			return this.allStoryFormats.map(f => ({
				label: f.name + ' ' + f.version,
				value: f.id
			}));
		},
		formatId() {
			// This will falsely return undefined or bad values while story formats
			// are being loaded (e.g. when formatLoadPercent is less than 1), because
			// we can't know until they load whether the format is for stories or
			// proofing. This is designed to provide the best possible value in the
			// circumstances, but in general, it will only be accurate after story
			// formats have loaded.

			const format = this.allStoryFormats.find(
				f =>
					f.name === this.story.storyFormat &&
					f.version === this.story.storyFormatVersion
			);

			if (format) {
				return format.id;
			}

			// We can't find the right story format--default to the user preference.

			const defaultFormat = this.allStoryFormats.find(
				f =>
					f.name === this.$store.state.pref.storyFormat.name &&
					f.version === this.$store.state.pref.storyFormat.version
			);

			if (defaultFormat) {
				return defaultFormat.id;
			}

			// We can't even find the preference, so go with the first format
			// available if possible.

			return this.allStoryFormats.length > 0
				? this.allStoryFormats[0].id
				: undefined;
		}
	},
	data() {
		return {
			highlightText: '',
			showFormatSelect: false,
			showRenamePrompt: false
		};
	},
	methods: {
		createPassage() {
			this.$emit('create-passage');
		},
		editJavaScript() {
			this.$router.push(`/stories/${this.story.id}/javascript`);
		},
		editStylesheet() {
			this.$router.push(`/stories/${this.story.id}/stylesheet`);
		},
		findAndReplace() {
			this.$router.push(`/stories/${this.story.id}/search`);
		},
		playStory() {
			launchStory(this.$store, this.story.id);
		},
		proofStory() {
			launchStory(this.$store, this.story.id, {proof: true});
		},
		setStoryFormat(value) {
			const format = this.allStoryFormats.find(f => f.id === value);

			if (!format) {
				throw new Error(`Can't find story format with ID "${value}"`);
			}

			this.$store.dispatch('story/updateStory', {
				storyId: this.story.id,
				storyProps: {
					storyFormat: format.name,
					storyFormatVersion: format.version
				}
			});
			this.toggleFormatSelect();
		},
		testStory() {
			launchStory(this.$store, this.story.id, {test: true});
		},
		renameStory(value) {
			this.$store.dispatch('story/updateStory', {
				storyId: this.story.id,
				storyProps: {name: value}
			});
			this.toggleRenamePrompt();
		},
		selectAllPassages() {
			this.$store.dispatch('story/selectAllPassages', {
				storyId: this.story.id
			});
		},
		showStoryStats() {
			this.$router.push(`/stories/${this.story.id}/statistics`);
		},
		toggleFormatSelect() {
			this.showFormatSelect = !this.showFormatSelect;

			if (this.showFormatSelect) {
				this.$store.dispatch('storyFormat/loadAllFormats');
			}
		},
		toggleRenamePrompt() {
			this.showRenamePrompt = !this.showRenamePrompt;
		},
		toggleSnapToGrid() {
			this.$store.dispatch('story/updateStory', {
				storyId: this.story.id,
				storyProps: {snapToGrid: !this.story.snapToGrid}
			});
		},
		zoomIn() {
			this.$store.dispatch('story/changeZoom', {
				change: 0.1,
				storyId: this.story.id
			});
		},
		zoomOut() {
			this.$store.dispatch('story/changeZoom', {
				change: -0.1,
				storyId: this.story.id
			});
		}
	},
	name: 'story-edit-top-bar',
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
