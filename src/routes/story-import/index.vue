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
						<template
							v-if="
								toImport.includes(importStory) &&
									conflicts.includes(importStory)
							"
						>
							<br />
							<icon-image name="alert-triangle" />
							<span v-t="'storyImport.willReplaceExisting'" />
						</template>
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
import FileUpload from '@/components/control/file-upload';
import IconButton from '@/components/control/icon-button';
import IconImage from '@/components/icon-image';
import MainContent from '@/components/container/main-content';
import TopBar from '@/components/container/top-bar';

export default {
	components: {FileUpload, IconButton, IconImage, MainContent, TopBar},
	computed: {
		canImport() {
			return this.uploadSource ? importStories(this.uploadSource) : [];
		},
		conflicts() {
			return this.canImport.filter(story =>
				this.$store.state.story.stories.some(s => s.name === story.name)
			);
		}
	},
	data() {
		return {toImport: [], uploadSource: null};
	},
	methods: {
		importSelectedStories() {
			this.toImport.forEach(story => {
				const oldStory = this.$store.state.story.stories.find(
					s => s.name === story.name
				);

				/*
				If we're replacing an existing story, do an update instead--if that
				fails, we hopefully haven't trashed the existing story.
				*/

				if (oldStory) {
					const storyProps = {...story};

					delete storyProps.id;
					this.$store.dispatch('story/updateStory', {
						storyProps,
						storyId: oldStory.id
					});
				} else {
					this.$store.dispatch('story/createStory', {
						storyProps: story
					});
				}
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
