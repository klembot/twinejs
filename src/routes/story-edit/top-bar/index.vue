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
				<text-line placeholder="Quick Find" />
			</template>
		</top-bar>
		<top-select
			@cancel="toggleFormatSelect"
			:defaultValue="formatId"
			:loadingMessage="
				allFormatsLoaded ? undefined : $t('storyEdit.topBar.loadingFormats')
			"
			:message="$t('storyEdit.topBar.setStoryFormatPrompt')"
			:options="formatOptions"
			@submit="setStoryFormat"
			:visible="showFormatSelect"
		/>
		<top-prompt
			@cancel="toggleRenamePrompt"
			:message="$t('storyEdit.topBar.renameStoryPrompt', {name: story.name})"
			@submit="renameStory"
			:visible="showRenamePrompt"
		/>
	</div>
</template>

<script>
import DropdownButton from '@/components/input/dropdown-button';
import IconButton from '@/components/input/icon-button';
import TextLine from '@/components/input/text-line';
import TopBar from '@/components/main-layout/top-bar';
import TopPrompt from '@/components/main-layout/top-prompt';
import TopSelect from '@/components/main-layout/top-select';
import openUrl from '@/util/open-url';
import '@/styles/accessibility.less';

export default {
	components: {
		DropdownButton,
		IconButton,
		TextLine,
		TopBar,
		TopPrompt,
		TopSelect
	},
	computed: {
		allFormatsLoaded() {
			return this.$store.getters['storyFormat/allFormatsLoaded'];
		},
		allStoryFormats() {
			return this.$store.getters['storyFormat/allStoryFormats'];
		},
		formatOptions() {
			return this.allStoryFormats.map(f => ({
				name: f.name + ' ' + f.version,
				value: f.id
			}));
		},
		formatId() {
			console.log(this.story, this.allStoryFormats);

			const format = this.allStoryFormats.find(
				f =>
					f.name === this.story.storyFormatName &&
					f.version === this.story.storyFormatVersion
			);

			if (format) {
				return format.id;
			}

			return undefined;
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
			openUrl(`/stories/${this.story.id}/play`);
		},
		proofStory() {
			openUrl(`/stories/${this.story.id}/proof`);
		},
		setStoryFormat(value) {
			const format = this.allStoryFormats.find(f => f.id === value);

			if (!format) {
				throw new Error(`Can't find story format with ID "${value}"`);
			}

			this.$store.dispatch('story/updateStory', {
				storyId: this.story.id,
				storyProps: {
					storyFormatName: format.name,
					storyFormatVersion: format.version
				}
			});
			this.toggleFormatSelect();
		},
		testStory() {
			openUrl(`/stories/${this.story.id}/test`);
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
