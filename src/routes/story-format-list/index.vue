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
			<h1 v-t="'storyFormats.storyFormats'" />
			<p v-t="'storyFormats.storyFormatExplanation'" />
			<div class="format-list">
				<story-format-item
					v-for="(format, index) in currentStoryFormats"
					:format="format"
					:key="index"
					@select="setStoryFormat"
					:selected="
						format.name === storyFormatPref.name &&
							format.version === storyFormatPref.version
					"
					:selectedText="$t('storyFormats.selectedStoryFormat')"
					:selectLabel="$t('storyFormats.useAsDefault')"
				/>
			</div>
			<template v-if="outdatedStoryFormats.length > 0">
				<p v-t="'storyFormats.outdatedFormatExplanation'" />
				<div class="format-list">
					<story-format-item
						v-for="(format, index) in outdatedStoryFormats"
						:format="format"
						:key="index"
						@select="setStoryFormat"
						:selected="
							format.name === storyFormatPref.name &&
								format.version === storyFormatPref.version
						"
						:selectedText="$t('storyFormats.selectedStoryFormat')"
						:selectLabel="$t('storyFormats.useAsDefault')"
					/>
				</div>
			</template>
			<h1 v-t="'storyFormats.proofingFormats'" />
			<p v-t="'storyFormats.proofingFormatExplanation'" />
			<div class="format-list">
				<story-format-item
					v-for="(format, index) in currentProofingFormats"
					:format="format"
					:key="index"
					@select="setProofingFormat"
					:selected="
						format.name === proofingFormatPref.name &&
							format.version === proofingFormatPref.version
					"
					:selectedText="$t('storyFormats.selectedProofingFormat')"
					:selectLabel="$t('storyFormats.useAsProofing')"
				/>
			</div>
			<template v-if="outdatedProofingFormats.length > 0">
				<p v-t="'storyFormats.outdatedFormatExplanation'" />
				<div class="format-list">
					<story-format-item
						v-for="(format, index) in outdatedProofingFormats"
						:format="format"
						:key="index"
						@select="setProofingFormat"
						:selected="
							format.name === proofingFormatPref.name &&
								format.version === proofingFormatPref.version
						"
						:selectedText="$t('storyFormats.selectedProofingFormat')"
						:selectLabel="$t('storyFormats.useAsProofing')"
					/>
				</div>
			</template>
		</main-content>
	</div>
</template>

<script>
import {parse} from 'semver-utils';
import IconButton from '@/components/input/icon-button';
import TopBar from '@/components/main-layout/top-bar';
import MainContent from '@/components/main-layout/main-content';
import StoryFormatItem from '@/components/story-format/story-format-item';
import './index.less';

export default {
	components: {IconButton, MainContent, StoryFormatItem, TopBar},
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
		proofingFormatPref() {
			return this.$store.state.pref.proofingFormat;
		},
		storyFormatPref() {
			return this.$store.state.pref.storyFormat;
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
