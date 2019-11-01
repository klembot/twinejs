<template>
	<base-modal
		:classes="['story-stats-modal']"
		@close="onClose"
		:id="id"
		:open="open"
	>
		<template v-slot:title>
			<h2 v-t="'dialogs.storyStats.dialogTitle'" />
		</template>
		<template v-slot:content>
			<table class="story-stats">
				<tr>
					<td>{{ characters }}</td>
					<td v-t="'dialogs.storyStats.characters'" />
				</tr>
				<tr>
					<td>{{ words }}</td>
					<td v-t="'dialogs.storyStats.words'" />
				</tr>
				<tr>
					<td>{{ passages }}</td>
					<td v-t="'dialogs.storyStats.passages'" />
				</tr>
				<tr>
					<td>{{ links }}</td>
					<td v-t="'dialogs.storyStats.links'" />
				</tr>
				<tr>
					<td>{{ brokenLinks }}</td>
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
		</template>
	</base-modal>
</template>

<script>
import BaseModal from './base-modal';

export default {
	components: {BaseModal},
	methods: {
		onClose() {
			this.$emit('close');
		}
	},
	props: {
		brokenLinks: {
			required: true,
			type: Number
		},
		characters: {
			required: true,
			type: Number
		},
		id: {
			required: true,
			type: String
		},
		ifid: {
			required: true,
			type: String
		},
		lastUpdate: {
			required: true,
			type: Date
		},
		links: {
			required: true,
			type: Number
		},
		open: {
			type: Boolean
		},
		passages: {
			required: true,
			type: Number
		},
		words: {
			required: true,
			type: Number
		}
	}
};
</script>
