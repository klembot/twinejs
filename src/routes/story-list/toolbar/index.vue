<template>
	<div class="story-list-toolbar fixed right">
		<raised-paper class="fill" elevation="high">
			<div class="fill justified padded vertical">
				<div class="justified-start">
					<img :src="appIcon" alt class="app-icon" />
					<h2 v-t="'common.appName'" />
				</div>
				<div class="justified-middle">
					<create-story-button />
					<icon-button
						icon="upload"
						label="storyList.toolbar.importFromFile"
						:title="$t('storyList.toolbar.importFromFileExplanation')"
						type="flat"
					/>
					<icon-button
						icon="briefcase"
						label="storyList.toolbar.archive"
						:title="$t('storyList.toolbar.archiveExplanation')"
						type="flat"
					/>
					<icon-button
						@click="toggleFormatListModal"
						icon="file-text"
						label="storyList.toolbar.storyFormats"
						:title="$t('storyList.toolbar.storyFormatsExplanation')"
						type="flat"
					/>
					<icon-button
						@click="setLanguage"
						icon="globe"
						label="storyList.toolbar.language"
						title="$t('storyList.toolbar.languageDescription')"
						type="flat"
					/>
					<icon-button
						@click="showHelp"
						icon="help-circle"
						label="storyList.toolbar.help"
						title="$t('storyList.toolbar.helpDescription')"
						type="flat"
					/>
				</div>
				<div class="justified-end">
					<div class="smaller">
						<local-storage-quota v-if="!isElectron" />
						<p>
							<br />
							<icon-button
								@click="showBugs"
								icon="send"
								label="storyList.toolbar.reportBug"
								type="flat"
							/>
						</p>
					</div>
				</div>
			</div>
		</raised-paper>
		<format-list-modal
			@add-story-format="addStoryFormat"
			@close="toggleFormatListModal"
			@delete-story-format="deleteStoryFormat"
			:formats="formats"
			id="story-list-format-list-modal"
			:open="formatListModalOpen"
			:proofing-format-pref="proofingFormatPref"
			@set-default-story-format="setDefaultStoryFormat"
			@set-proofing-format="setProofingFormat"
			:story-format-pref="storyFormatPref"
		/>
	</div>
</template>

<script>
import CreateStoryButton from './create-story-button';
import FormatListModal from '@/components/modal/format-list-modal';
import IconButton from '@/components/input/icon-button';
import isElectron from '@/util/is-electron';
import openUrl from '@/util/open-url';
import LocalStorageQuota from '@/components/local-storage-quota';
import RaisedPaper from '@/components/surface/raised-paper';
import AppIcon from '@/../icons/app.svg';
import './index.less';

export default {
	components: {
		CreateStoryButton,
		FormatListModal,
		IconButton,
		LocalStorageQuota,
		RaisedPaper
	},
	computed: {
		isElectron,
		appIcon() {
			return AppIcon;
		},
		formats() {
			return this.$store.state.storyFormat.formats;
		},
		proofingFormatPref() {
			return this.$store.state.pref.proofingFormat;
		},
		storyFormatPref() {
			return this.$store.state.pref.storyFormat;
		}
	},
	data() {
		return {aboutModalOpen: false, formatListModalOpen: false};
	},
	methods: {
		addStoryFormat(url) {
			this.$store.dispatch('storyFormat/addFormatFromUrl', {
				storyFormatUrl: url
			});
		},
		deleteStoryFormat(format) {
			this.$store.dispatch('storyFormat/deleteFormat', {
				storyFormatId: format.id
			});
		},
		setDefaultStoryFormat(format) {
			this.$store.dispatch('pref/update', {
				storyFormat: {name: format.name, version: format.version}
			});
		},
		setProofingFormat(format) {
			this.$store.dispatch('pref/update', {
				proofingFormat: {name: format.name, version: format.version}
			});
		},
		setLanguage() {
			this.$router.push('/locale');
		},
		hideAboutModal() {
			this.aboutModalOpen = false;
		},
		showAboutModal() {
			this.aboutModalOpen = true;
		},
		showBugs() {
			openUrl('https://twinery.org/2bugs');
		},
		showHelp() {
			openUrl('https://twinery.org/2guide');
		},
		toggleFormatListModal() {
			this.formatListModalOpen = !this.formatListModalOpen;
			if (this.formatListModalOpen) {
				this.$store.dispatch('storyFormat/loadAllFormats');
			}
		}
	},
	name: 'story-list-toolbar'
};
</script>
