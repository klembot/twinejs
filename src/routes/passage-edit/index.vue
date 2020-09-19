<template>
	<div class="passage-edit">
		<top-bar :back-route="`/stories/${this.story.id}`" :back-label="story.name">
			<template v-slot:actions>
				<icon-button @click="onTest" icon="tool" label="Test Story From Here" />
				<icon-button @click="toggleRename" icon="type" label="Rename" />
				<icon-button icon="maximize" label="Size" />
				<icon-button icon="play-circle" label="Set as Start" />
				<icon-button
					@click="toggleDelete"
					icon="trash-2"
					label="Delete Passage"
					type="danger"
				/>
			</template>
		</top-bar>
		<top-confirm
			@cancel="toggleDelete"
			@confirm="onDelete"
			confirmIcon="trash-2"
			confirmLabel="common.delete"
			confirmType="danger"
			:message="$t('passageEdit.deletePrompt')"
			:visible="deleteVisible"
		/>
		<top-prompt
			@cancel="toggleRename"
			:defaultValue="passage.name"
			:message="$t('passageEdit.renamePrompt')"
			@submit="onRename"
			submitLabel="common.rename"
			:visible="renameVisible"
		>
		</top-prompt>
		<main-content :title="passage.name">
			<code-area @change="onChangeText" :value="passage.text" />
		</main-content>
	</div>
</template>

<script>
import CodeArea from '@/components/input/code-area';
import IconButton from '@/components/input/icon-button';
import TopBar from '@/components/main-layout/top-bar';
import MainContent from '@/components/main-layout/main-content';
import openUrl from '@/util/open-url';
import TopConfirm from '@/components/main-layout/top-confirm';
import TopPrompt from '@/components/main-layout/top-prompt';
import './index.less';

export default {
	components: {
		CodeArea,
		IconButton,
		MainContent,
		TopBar,
		TopConfirm,
		TopPrompt
	},
	computed: {
		passage() {
			return this.story.passages.find(
				p => p.id === this.$route.params.passageId
			);
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
	data() {
		return {deleteVisible: false, oldText: '', renameVisible: false};
	},
	beforeRouteLeave(to, from, next) {
		try {
			this.$store.dispatch('story/createNewlyLinkedPassages', {
				oldText: this.oldText,
				passageId: this.passage.id,
				storyId: this.story.id
			});
		} catch (e) {
			// TODO: show error message to user.

			console.warn(
				`Tried to create newly linked passages but failed, continuing: ${e}`
			);
		}

		next();
	},
	methods: {
		onChangeText(value) {
			this.$store.dispatch('story/updatePassage', {
				passageId: this.passage.id,
				passageProps: {text: value},
				storyId: this.story.id
			});
		},
		onDelete() {
			this.$store.dispatch('story/deletePassage', {
				passageId: this.passage.id,
				storyId: this.story.id
			});
			this.$router.push(`/stories/${this.story.id}`);
		},
		onRename(value) {
			this.$store.dispatch('story/updatePassage', {
				passageId: this.passage.id,
				passageProps: {name: value},
				storyId: this.story.id
			});
			this.renameVisible = false;
		},
		toggleDelete() {
			this.deleteVisible = !this.deleteVisible;
		},
		toggleRename() {
			this.renameVisible = !this.renameVisible;
		},
		onTest() {
			openUrl(`/stories/${this.story.id}/test/${this.passage.id}`);
		}
	},
	mounted() {
		this.oldText = this.passage.text;
	},
	name: 'passage-edit'
};
</script>
