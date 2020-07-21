<template>
	<div class="passage-edit">
		<top-bar :back-route="`/stories/${this.story.id}`" :back-label="story.name">
			<template v-slot:actions>
				<icon-button icon="tool" label="Test Story From Here" />
				<icon-button icon="type" label="Rename" />
				<icon-button icon="maximize" label="Size" />
				<icon-button icon="play-circle" label="Set as Start" />
				<icon-button icon="trash-2" label="Delete Passage" type="danger" />
			</template>
		</top-bar>
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
import './index.less';

export default {
	components: {CodeArea, IconButton, MainContent, TopBar},
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
		return {oldText: ''};
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
				storyId: this.story.id,
				passageProps: {text: value}
			});
		}
	},
	mounted() {
		this.oldText = this.passage.text;
	},
	name: 'passage-edit'
};
</script>
