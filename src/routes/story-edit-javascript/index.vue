<template>
	<div class="story-edit-javascript">
		<top-bar
			:back-route="`/stories/${this.story.id}`"
			:back-label="story.name"
		/>
		<main-content :title="$t('editors.storyJavaScript.dialogTitle')">
			<p v-t="'editors.storyJavaScript.dialogExplanation'" />
			<font-picker
				@change="onChangeEditorFont"
				:font-family="editorFont.family"
				:font-scale="editorFont.scale"
			/>
			<code-area
				@change="onChange"
				:font-family="editorFont.family"
				:font-scale="editorFont.scale"
				font="monospace"
				mode="javascript"
				:value="story.script"
			/>
		</main-content>
	</div>
</template>

<script>
import CodeArea from '@/components/control/code-area';
import FontPicker from '@/components/control/font-picker';
import MainContent from '@/components/container/main-content';
import TopBar from '@/components/container/top-bar';
import './index.css';

export default {
	components: {CodeArea, FontPicker, MainContent, TopBar},
	computed: {
		editorFont() {
			return {
				family: this.$store.state.pref.javascriptEditorFontFamily,
				scale: this.$store.state.pref.javascriptEditorFontScale
			};
		},
		story() {
			const result = this.$store.state.story.stories.find(
				s => s.id === this.$route.params.storyId
			);

			if (!result) {
				console.warn(
					`There is no story in the data store with ID "${this.$route.params.id}".`
				);

				// TODO: show error message to user instead.
			}

			return result;
		}
	},
	methods: {
		onChange(value) {
			this.$store.dispatch('story/updateStory', {
				storyId: this.story.id,
				storyProps: {script: value}
			});
		},
		onChangeEditorFont({fontFamily, fontScale}) {
			this.$store.dispatch('pref/update', {
				javascriptEditorFontFamily: fontFamily,
				javascriptEditorFontScale: fontScale
			});
		}
	},
	name: 'story-edit-javascript'
};
</script>
