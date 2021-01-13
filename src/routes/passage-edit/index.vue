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
		<confirm-modal
			@cancel="toggleDelete"
			@confirm="onDelete"
			confirmIcon="trash-2"
			confirmLabel="common.delete"
			confirmType="danger"
			:detail="$t('passageEdit.deleteDetail')"
			:message="$t('passageEdit.deleteMessage')"
			:visible="deleteVisible"
		/>
		<prompt-modal
			@cancel="toggleRename"
			:defaultValue="passage.name"
			:detail="$t('passageEdit.renameDetail')"
			:message="$t('passageEdit.renameMessage')"
			@submit="onRename"
			submitLabel="common.rename"
			:visible="renameVisible"
		/>
		<main-content :title="passage.name">
			<tag-toolbar
				:passage="passage"
				:tagColors="story.tagColors"
				@add-tag="onAddTag"
				@edit-tag="onEditTag"
				@remove-tag="onRemoveTag"
			/>
			<code-area @change="onChangeText" :value="passage.text" />
		</main-content>
	</div>
</template>

<script>
import CodeArea from '@/components/control/code-area';
import DropdownButton from '@/components/control/dropdown-button';
import IconButton from '@/components/control/icon-button';
import launchStory from '@/util/launch-story';
import TopBar from '@/components/container/top-bar';
import MainContent from '@/components/container/main-content';
import ConfirmModal from '@/components/modal/confirm-modal';
import PromptModal from '@/components/modal/prompt-modal';
import TagToolbar from './tag-toolbar';
import './index.css';

export default {
	components: {
		CodeArea,
		ConfirmModal,
		DropdownButton,
		IconButton,
		MainContent,
		PromptModal,
		TagToolbar,
		TopBar
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
		onAddTag({color, name}) {
			this.$store.dispatch('story/addPassageTag', {
				passageId: this.passage.id,
				storyId: this.story.id,
				tagName: name
			});
			this.$store.dispatch('story/setTagColor', {
				storyId: this.story.id,
				tagColor: color,
				tagName: name
			});
		},
		onEditTag({newColor, newName, oldColor, oldName}) {
			if (newName !== oldName) {
				this.$store.dispatch('story/renameTag', {
					newTagName: newName,
					oldTagName: oldName,
					storyId: this.story.id
				});
			}

			if (newColor !== oldColor) {
				this.$store.dispatch('story/setTagColor', {
					storyId: this.story.id,
					tagColor: newColor,
					tagName: newName
				});
			}
		},
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
		onRemoveTag(tagName) {
			this.$store.dispatch('story/removePassageTag', {
				tagName,
				passageId: this.passage.id,
				storyId: this.story.id
			});
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
			launchStory(this.$store, this.story.id, {
				startPassage: this.passage.id,
				test: true
			});
		}
	},
	mounted() {
		this.oldText = this.passage.text;
	},
	name: 'passage-edit'
};
</script>
