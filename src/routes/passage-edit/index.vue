<template>
	<div class="passage-edit">
		<top-bar :back-route="`/stories/${this.story.id}`" :back-label="story.name">
			<template v-slot:actions>
				<icon-button
					@click="onTest"
					icon="tool"
					label="passageEdit.testFromHere"
				/>
				<icon-button @click="toggleRename" icon="type" label="common.rename" />
				<dropdown-button icon="maximize" label="passageEdit.size">
					<icon-button
						@click="onChangeSize('small')"
						:icon="sizeDescription === 'small' ? 'check' : 'empty'"
						label="passageEdit.sizeSmall"
					/>
					<icon-button
						@click="onChangeSize('tall')"
						:icon="sizeDescription === 'tall' ? 'check' : 'empty'"
						label="passageEdit.sizeTall"
					/>
					<icon-button
						@click="onChangeSize('wide')"
						:icon="sizeDescription === 'wide' ? 'check' : 'empty'"
						label="passageEdit.sizeWide"
					/>
					<icon-button
						@click="onChangeSize('large')"
						:icon="sizeDescription === 'large' ? 'check' : 'empty'"
						label="passageEdit.sizeLarge"
					/>
				</dropdown-button>
				<icon-button
					:active="isStartPassage"
					@click="onSetAsStart"
					icon="play-circle"
					label="passageEdit.setAsStart"
				/>
				<icon-button
					@click="toggleDelete"
					icon="trash-2"
					label="passageEdit.deletePassage"
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
import DropdownButton from '@/components/input/dropdown-button';
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
		DropdownButton,
		IconButton,
		MainContent,
		TopBar,
		TopConfirm,
		TopPrompt
	},
	computed: {
		isStartPassage() {
			return this.passage.id === this.story.startPassage;
		},
		passage() {
			return this.$store.getters['story/passageInStoryWithId'](
				this.$route.params.storyId,
				this.$route.params.passageId
			);
		},
		sizeDescription() {
			return this.$store.getters['story/passageSizeDescription'](
				this.$route.params.storyId,
				this.$route.params.passageId
			);
		},
		story() {
			const result = this.$store.getters['story/storyWithId'](
				this.$route.params.storyId
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
		onChangeSize(passageSizeDescription) {
			this.$store.dispatch('story/updatePassageSize', {
				passageSizeDescription,
				passageId: this.passage.id,
				storyId: this.story.id
			});
		},
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
		onSetAsStart() {
			this.$store.dispatch('story/updateStory', {
				storyId: this.story.id,
				storyProps: {startPassage: this.passage.id}
			});
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
