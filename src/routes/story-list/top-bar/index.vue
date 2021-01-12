<template>
	<div class="story-list-top-bar">
		<top-bar>
			<template v-slot:actions>
				<icon-button
					@click="toggleCreatePrompt"
					icon="plus-circle"
					label="storyList.topBar.createStory"
					type="create"
					:title="$t('storyList.topBar.createStoryExplanation')"
				/>
				<dropdown-button
					icon="bar-chart"
					label="storyList.topBar.sort"
					title="$t('storyList.topBar.sortDescription')"
				>
					<icon-button
						@click="changeSort('lastUpdate', true)"
						:icon="sortBy === 'lastUpdate' ? 'check' : 'empty'"
						label="storyList.topBar.sortDate"
						title="$t('storyList.topBar.sortDateDescription')"
					/>
					<icon-button
						@click="changeSort('name', false)"
						:icon="sortBy === 'name' ? 'check' : 'empty'"
						label="storyList.topBar.sortTitle"
						title="$t('storyList.topBar.sortTitleDescription')"
					/>
				</dropdown-button>
				<icon-button
					@click="downloadArchive"
					icon="package"
					label="storyList.topBar.archive"
					:title="$t('storyList.topBar.archiveExplanation')"
				/>
				<icon-button
					@click="importStories"
					icon="upload"
					label="common.import"
					:title="$t('storyList.topBar.importFromFileExplanation')"
				/>
				<icon-button
					@click="showStoryFormats"
					icon="file-text"
					label="storyList.topBar.storyFormats"
					:title="$t('storyList.topBar.storyFormatsExplanation')"
				/>
				<icon-button
					@click="showHelp"
					icon="help-circle"
					label="storyList.topBar.help"
					title="$t('storyList.topBar.helpDescription')"
				/>
				<dropdown-button
					icon="more-horizontal"
					label="common.more"
					title="$t('storyList.topBar.helpDescription')"
				>
					<icon-button
						@click="setLanguage"
						icon="globe"
						label="storyList.topBar.language"
						title="$t('storyList.topBar.languageDescription')"
					/>
					<icon-button
						@click="showAbout"
						icon="info"
						label="storyList.topBar.about"
					/>
					<icon-button
						@click="showBugs"
						icon="frown"
						label="storyList.topBar.reportBug"
					/>
				</dropdown-button>
			</template>
			<template v-slot:status v-if="!isElectron">
				<!-- <local-storage-quota /> -->
			</template>
		</top-bar>
		<prompt-modal
			@cancel="toggleCreatePrompt"
			:detail="$t('storyList.topBar.createStoryPromptDetail')"
			:message="$t('storyList.topBar.createStoryPromptMessage')"
			@submit="createStory"
			submit-icon="plus"
			submit-label="common.create"
			submit-type="create"
			:visible="createPromptVisible"
		/>
	</div>
</template>

<script>
import {archiveFilename} from '@/util/publish';
import DropdownButton from '@/components/control/dropdown-button';
import IconButton from '@/components/control/icon-button';
import isElectron from '@/util/is-electron';
import launchUrl from '@/util/launch-url';
import {publishArchive} from '@/store/publish';
import LocalStorageQuota from '@/components/local-storage-quota';
import PromptModal from '@/components/modal/prompt-modal';
import saveHtml from '@/util/save-html';
import TopBar from '@/components/container/top-bar';

export default {
	components: {
		DropdownButton,
		IconButton,
		LocalStorageQuota,
		PromptModal,
		TopBar
	},
	computed: {
		isElectron
	},
	data() {
		return {createPromptVisible: false};
	},
	methods: {
		changeSort(field, invertSort) {
			this.$emit('changeSort', field, invertSort);
		},
		createStory(name) {
			this.$store.dispatch('story/createStory', {
				storyProps: {name}
			});
			this.toggleCreatePrompt();
		},
		downloadArchive() {
			// TODO: error handling
			saveHtml(publishArchive(this.$store), archiveFilename());
		},
		importStories() {
			this.$router.push('/import');
		},
		setLanguage() {
			this.$router.push('/locale');
		},
		showAbout() {
			this.$router.push('/about');
		},
		showBugs() {
			launchUrl('https://twinery.org/2bugs');
		},
		showHelp() {
			launchUrl('https://twinery.org/2guide');
		},
		showStoryFormats() {
			this.$router.push('/story-formats');
		},
		toggleCreatePrompt() {
			this.createPromptVisible = !this.createPromptVisible;
		}
	},
	name: 'story-list-top-bar',
	props: {
		sortBy: {
			required: true,
			type: String
		}
	}
};
</script>
