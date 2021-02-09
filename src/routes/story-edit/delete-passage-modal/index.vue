<template>
	<confirm-modal
		@cancel="onCancel"
		@confirm="onConfirm"
		confirm-icon="trash-2"
		confirm-label="common.delete"
		confirm-type="danger"
		:detail="detail"
		dom-id="delete-passages"
		:message="message"
		:visible="passages.length > 0"
	/>
</template>

<script>
import ConfirmModal from '@/components/modal/confirm-modal';

export default {
	components: {ConfirmModal},
	computed: {
		detail() {
			/* We only allow shortcutting deletion of a single passage at a time. */

			if (this.passages.length === 1) {
				return this.$t('storyEdit.deletePassageModal.skip');
			}

			return '';
		},
		message() {
			if (this.passages.length === 0) {
				return '';
			}

			if (this.passages.length === 1) {
				return this.$t('storyEdit.deletePassageModal.deleteSingle', {
					passageName: this.passages[0].name
				});
			}

			return this.$t('storyEdit.deletePassageModal.deleteMultiple', {
				count: this.passages.length
			});
		}
	},
	methods: {
		onCancel() {
			this.$emit('cancel');
		},
		onConfirm() {
			this.$emit('confirm');
		}
	},
	name: 'delete-passage-modal',
	props: {
		passages: {required: true, type: Array}
	}
};
</script>
