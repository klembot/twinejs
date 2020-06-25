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
						icon="check"
						label="storyList.topBar.sortDate"
						title="$t('storyList.topBar.sortDateDescription')"
					/>
					<icon-button
						icon="empty"
						label="storyList.topBar.sortTitle"
						title="$t('storyList.topBar.sortTitleDescription')"
					/>
				</dropdown-button>
				<icon-button
					icon="upload"
					label="storyList.topBar.importFromFile"
					:title="$t('storyList.topBar.importFromFileExplanation')"
				/>
				<icon-button
					icon="briefcase"
					label="storyList.topBar.archive"
					:title="$t('storyList.topBar.archiveExplanation')"
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
		<top-prompt
			@cancel="toggleCreatePrompt"
			:message="$t('storyList.topBar.createStoryPrompt')"
			@submit="createStory"
			submit-icon="plus"
			submit-label="common.create"
			submit-type="create"
			:visible="createPromptVisible"
		/>
	</div>
</template>

<script>
import DropdownButton from '@/components/input/dropdown-button';
import IconButton from '@/components/input/icon-button';
import isElectron from '@/util/is-electron';
import openUrl from '@/util/open-url';
import LocalStorageQuota from '@/components/local-storage-quota';
import TopBar from '@/components/top-layout/top-bar';
import TopPrompt from '@/components/top-layout/top-prompt';

export default {
	components: {
		DropdownButton,
		IconButton,
		LocalStorageQuota,
		TopBar,
		TopPrompt
	},
	computed: {
		isElectron
	},
	data() {
		return {createPromptVisible: false};
	},
	methods: {
		createStory(name) {
			this.$store.dispatch('story/createStory', {
				storyProps: {name}
			});
			this.toggleCreatePrompt();
		},
		setLanguage() {
			this.$router.push('/locale');
		},
		showAbout() {
			this.$router.push('/about');
		},
		showBugs() {
			openUrl('https://twinery.org/2bugs');
		},
		showHelp() {
			openUrl('https://twinery.org/2guide');
		},
		showStoryFormats() {
			this.$router.push('/story-formats');
		},
		toggleCreatePrompt() {
			this.createPromptVisible = !this.createPromptVisible;
		}
	},
	name: 'story-list-top-bar'
};
</script>
