<template>
	<base-modal @close="onClose" :open="open">
		<template v-slot:title>
			<h2 v-t="'dialogs.findReplace.dialogTitle'" />
		</template>
		<template v-slot:content>
			<label>
				<span v-t="'dialogs.findReplace.searchFor'" />
				<textarea></textarea>
			</label>
			<label>
				<input type="checkbox" />
				<span v-t="'dialogs.findReplace.includePassageNames'" />
			</label>
			<label>
				<input type="checkbox" />
				<span v-t="'dialogs.findReplace.matchCase'" />
			</label>
			<label>
				<input type="checkbox" />
				<span v-t="'dialogs.findReplace.useRegexes'" />
			</label>
			<label>
				<span v-t="'dialogs.findReplace.replaceWith'" />
				<textarea></textarea>
			</label>
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
		open: {
			default: false,
			type: Boolean
		},
		story: {
			required: true,
			type: Object
		}
	}
};
</script>
