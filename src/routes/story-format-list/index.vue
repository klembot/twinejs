<template>
	<div class="story-format-list">
		<top-bar back-route="/" :back-label="$t('storyList.title')">
			<template v-slot:actions>
				<icon-button
					icon="plus-circle"
					label="storyFormats.addFormat"
					type="create"
				/>
			</template>
		</top-bar>
		<main-content>
			<template v-if="loadPercent < 100">
				<meter-bar :percent="loadPercent">
					<icon-image name="loading-spinner" />
					<span
						v-t="{
							path: 'storyFormats.loadingFormat',
							args: {name: loadingFormat.name + ' ' + loadingFormat.version}
						}"
					/>
				</meter-bar>
			</template>
			<template v-else>
				<story-format-group
					:detail="$t('storyFormats.storyFormatExplanation')"
					:formats="currentStoryFormats"
					:header="$t('storyFormats.storyFormats')"
					@select="setStoryFormat"
					:selected-format="selectedStoryFormat"
					:select-label="$t('storyFormats.useAsDefault')"
				/>
				<story-format-group
					:detail="$t('storyFormats.outdatedStoryFormatExplanation')"
					:formats="outdatedStoryFormats"
					:header="$t('storyFormats.outdatedStoryFormats')"
					@select="setStoryFormat"
					:selected-format="selectedStoryFormat"
					:select-label="$t('storyFormats.useAsDefault')"
					v-if="outdatedStoryFormats.length > 0"
				/>
				<story-format-group
					:detail="$t('storyFormats.proofingFormatExplanation')"
					:formats="currentProofingFormats"
					:header="$t('storyFormats.proofingFormats')"
					@select="setProofingFormat"
					:selected-format="selectedProofingFormat"
					:select-label="$t('storyFormats.useAsProofing')"
				/>
				<story-format-group
					:detail="$t('storyFormats.outdatedProofingFormatExplanation')"
					:formats="outdatedProofingFormats"
					:header="$t('storyFormats.outdatedProofingFormats')"
					@select="setProofingFormat"
					:selected-format="selectedProofingFormat"
					:select-label="$t('storyFormats.useAsProofing')"
					v-if="outdatedProofingFormats.length > 0"
				/>
			</template>
		</main-content>
	</div>
</template>

<script>
import {parse} from 'semver-utils';
import IconButton from '@/components/control/icon-button';
import IconImage from '@/components/icon-image';
import TopBar from '@/components/container/top-bar';
import MainContent from '@/components/container/main-content';
import MeterBar from '@/components/meter-bar';
import StoryFormatGroup from '@/components/story-format/story-format-group';
import './index.css';

export default {
	components: {
		IconButton,
		IconImage,
		MainContent,
		MeterBar,
		StoryFormatGroup,
		TopBar
	},
	computed: {
		allFormats() {
			return this.$store.state.storyFormat.formats;
		},
		allProofingFormats() {
			return this.allFormats.filter(f => f.properties && f.properties.proofing);
		},
		allStoryFormats() {
			return this.allFormats.filter(
				f => f.properties && !f.properties.proofing
			);
		},
		currentProofingFormats() {
			return this.allProofingFormats.filter(
				f => !this.outdatedProofingFormats.includes(f)
			);
		},
		currentStoryFormats() {
			return this.allStoryFormats.filter(
				f => !this.outdatedStoryFormats.includes(f)
			);
		},
		loadingFormat() {
			return this.$store.getters['storyFormat/formatLoading'];
		},
		loadPercent() {
			return this.$store.getters['storyFormat/formatLoadPercent'] * 100;
		},
		outdatedProofingFormats() {
			return this.allProofingFormats.filter(f => {
				const {major} = parse(f.version);

				return !!this.allProofingFormats.find(otherF => {
					if (otherF.name !== f.name) {
						return false;
					}

					const {major: otherMajor} = parse(otherF.version);

					return otherMajor > major;
				});
			});
		},
		outdatedStoryFormats() {
			return this.allStoryFormats.filter(f => {
				const {major} = parse(f.version);

				return !!this.allStoryFormats.find(otherF => {
					if (otherF.name !== f.name) {
						return false;
					}

					const {major: otherMajor} = parse(otherF.version);

					return otherMajor > major;
				});
			});
		},
		selectedProofingFormat() {
			const {name, version} = this.$store.state.pref.proofingFormat;

			return this.allFormats.find(
				f => f.name === name && f.version === version
			);
		},
		selectedStoryFormat() {
			const {name, version} = this.$store.state.pref.storyFormat;

			return this.allFormats.find(
				f => f.name === name && f.version === version
			);
		}
	},
	methods: {
		setProofingFormat(format) {
			this.$store.dispatch('pref/update', {
				proofingFormat: {name: format.name, version: format.version}
			});
		},
		setStoryFormat(format) {
			this.$store.dispatch('pref/update', {
				storyFormat: {name: format.name, version: format.version}
			});
		}
	},
	watch: {
		storyFormats: {
			handler() {
				/*
				This will trigger loads on any unloaded formats, so it's
				harmless to call repeatedly.
				*/

				this.$store.dispatch('storyFormat/loadAllFormats');
			},
			immediate: true
		}
	},
	name: 'story-format-list'
};
</script>
