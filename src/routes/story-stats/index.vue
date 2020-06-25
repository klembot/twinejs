<template>
	<div class="story-stats">
		<top-bar
			:back-route="`/stories/${this.story.id}`"
			:back-label="story.name"
		/>
		<top-content>
			<h1 v-t="'dialogs.storyStats.dialogTitle'" />
			<table class="story-stats">
				<tr>
					<td>{{ stats.characters }}</td>
					<td v-t="'dialogs.storyStats.characters'" />
				</tr>
				<tr>
					<td>{{ stats.words }}</td>
					<td v-t="'dialogs.storyStats.words'" />
				</tr>
				<tr>
					<td>{{ stats.passages }}</td>
					<td v-t="'dialogs.storyStats.passages'" />
				</tr>
				<tr>
					<td>{{ stats.links }}</td>
					<td v-t="'dialogs.storyStats.links'" />
				</tr>
				<tr>
					<td>{{ stats.brokenLinks }}</td>
					<td v-t="'dialogs.storyStats.brokenLinks'" />
				</tr>
			</table>

			<!--p>This story was last changed at {{ lastUpdate.toLocaleString() }}.</p>
			<p>
				<span v-t="{path: 'The IFID of this story is {{ ifid }}.'}" />. (<a
					href="https://ifdb.tads.org/help-ifid"
					target="_blank"
					v-t="'What\'s an IFID?'"
				/>)
			</p-->
		</top-content>
	</div>
</template>

<script>
import TopBar from '@/components/top-layout/top-bar';
import TopContent from '@/components/top-layout/top-content';
import './index.less';

export default {
	components: {TopBar, TopContent},
	computed: {
		stats() {
			return this.$store.getters['story/storyStats'](this.story.id);
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
	name: 'story-stats'
};
</script>
