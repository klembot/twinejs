<template>
	<div class="story-import">
		<top-bar :back-label="$t('storyList.title')" back-route="/" />
		<main-content :title="$t('common.import')">
			<p v-t="'storyImport.uploadPrompt'" />
			<file-upload @upload="onUpload" />
			<template v-if="uploadSource && canImport.length === 0">
				<p v-t="'storyImport.noStoriesInFile'" />
			</template>
			<template v-if="canImport.length > 0">
				<p v-t="'storyImport.choosePrompt'" />
				<form @submit="importSelectedStories">
					<p v-for="importStory in canImport" :key="importStory.id">
						<label>
							<input
								:checked="toImport.includes(importStory)"
								@change="onSelectStory(importStory.id, $event)"
								type="checkbox"
							/>
							{{ importStory.name }}
						</label>
					</p>
					<icon-button
						@click="importSelectedStories"
						:disabled="toImport.length === 0"
						icon="check"
						label="common.import"
						type="primary"
						raised
					/>
				</form>
			</template>
		</main-content>
	</div>
</template>

<script>
import {importStories} from '@/util/import';
import FileUpload from '@/components/input/file-upload';
import IconButton from '@/components/input/icon-button';
import MainContent from '@/components/main-layout/main-content';
import TopBar from '@/components/main-layout/top-bar';

export default {
	components: {FileUpload, IconButton, MainContent, TopBar},
	computed: {
		canImport() {
			return this.uploadSource ? importStories(this.uploadSource) : [];
		}
	},
	data() {
		return {toImport: [], uploadSource: null};
	},
	methods: {
		importSelectedStories() {
			this.toImport.forEach(story => {
				this.$store.dispatch('story/createStory', {storyProps: story});
			});
			this.$router.push('/');
		},
		onSelectStory(id, event) {
			if (event.target.checked) {
				this.toImport.push(this.canImport.find(story => story.id === id));
			} else {
				this.toImport = this.toImport.filter(story => story.id !== id);
			}
		},
		onUpload(source) {
			this.uploadSource = source;
		}
	}
};
</script>
