<template>
	<base-modal
		:classes="['format-list-modal']"
		@close="onClose"
		:id="id"
		:open="open"
	>
		<template v-slot:title>
			<icon-button
				:active="selectedTab === 'story'"
				@click="selectTab('story')"
				v-t="'storyFormats.storyFormats'"
			/>
			<icon-button
				:active="selectedTab === 'proofing'"
				@click="selectTab('proofing')"
				v-t="'storyFormats.proofingFormats'"
			/>
			<icon-button
				:active="selectedTab === 'add'"
				@click="selectTab('add')"
				v-t="'storyFormats.addFormat'"
			/>
		</template>
		<template v-slot:content>
			<div v-if="selectedTab === 'story'">
				<p v-t="storyFormats.storyFormatExplanation"></p>
				<p v-t="storyFormats.defaultStoryFormat">
					<story-format-picker
						@delete-format="deleteStoryFormat"
						:formats="loadedPlayFormats"
						@select-format="setDefaultStoryFormat"
						select-icon="star"
						:select-label="$t('storyFormats.useAsDefault')"
						:selected-format="selectedStoryFormat"
					/>
				</p>
			</div>

			<div v-if="selectedTab === 'proofing'">
				<p v-t="storyFormats.proofingFormatExplanation" />
				<p v-t="storyFormats.selectedProofingFormat" />
				<story-format-picker
					@delete-format="deleteStoryFormat"
					:formats="loadedProofingFormats"
					@select-format="setProofingFormat"
					select-icon="star"
					:select-label="$t('storyFormats.useAsProofing')"
					:selected-format="selectedProofingFormat"
				/>
			</div>

			<div v-if="selectedTab === 'add'">
				<story-format-adder @add="addStoryFormat" />
			</div>
		</template>
	</base-modal>
</template>

<script>
import BaseModal from './base-modal';
import IconButton from '../input/icon-button';
import StoryFormatAdder from '../story-format/story-format-adder';
import StoryFormatPicker from '../story-format/story-format-picker';
import './format-list-modal.less';

export default {
	components: {BaseModal, IconButton, StoryFormatAdder, StoryFormatPicker},
	computed: {
		loadedFormats() {
			return this.formats.filter(f => f.loaded);
		},
		loadedPlayFormats() {
			// TODO: sort
			return this.loadedFormats.filter(f => !f.properties.proofing);
		},
		loadedProofingFormats() {
			// TODO: sort
			return this.loadedFormats.filter(f => f.properties.proofing);
		},
		selectedProofingFormat() {
			return this.loadedFormats.find(
				f =>
					f.name === this.proofingFormatPref.name &&
					f.version === this.proofingFormatPref.version
			);
		},
		selectedStoryFormat() {
			return this.loadedFormats.find(
				f =>
					f.name === this.storyFormatPref.name &&
					f.version === this.storyFormatPref.version
			);
		}
	},
	data() {
		return {selectedTab: 'story'};
	},
	methods: {
		addStoryFormat(url) {
			this.$emit('add-story-format', url);
		},
		deleteStoryFormat(format) {
			this.$emit('delete-story-format', format);
		},
		onClose() {
			this.$emit('close');
		},
		selectTab(value) {
			this.selectedTab = value;
		},
		setDefaultStoryFormat(format) {
			this.$emit('set-default-story-format', format);
		},
		setProofingFormat(format) {
			this.$emit('set-proofing-format', format);
		}
	},
	props: {
		formats: {
			required: true,
			type: Array
		},
		id: {
			required: true,
			type: String
		},
		open: {
			required: true,
			type: Boolean
		},
		proofingFormatPref: {
			required: true,
			type: Object
		},
		storyFormatPref: {
			required: true,
			type: Object
		}
	}
};
</script>
