<template>
	<base-modal
		@close="onClose"
		:classes="[...classes, 'editor-modal', expanded && 'expanded']"
		:id="id"
		:open="open"
	>
		<template v-slot:title>
			<slot name="title" />
		</template>
		<template v-slot:title-buttons>
			<icon-button @click="toggleExpanded" :icon="expandedIcon" />
		</template>
		<template v-slot:content>
			<slot name="content" />
		</template>
	</base-modal>
</template>

<script>
import BaseModal from './base-modal';
import IconButton from '../input/icon-button';
import './editor-modal.less';

export default {
	components: {BaseModal, IconButton},
	computed: {
		expandedIcon() {
			return this.expanded ? 'minimize-2' : 'maximize-2';
		}
	},
	data() {
		return {expanded: false};
	},
	methods: {
		onClose() {
			this.$emit('close');
		},
		toggleExpanded() {
			this.expanded = !this.expanded;
		}
	},
	props: {
		classes: {
			default: () => [],
			type: Array
		},
		id: {
			required: true,
			type: String
		},
		open: {
			default: false,
			type: Boolean
		}
	}
};
</script>
