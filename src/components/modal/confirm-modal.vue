<template>
	<base-modal @click-away="onCancel" :visible="visible">
		<div class="confirm-modal">
			<base-card>
				<template v-slot:header>{{ message }}</template>
				<p v-if="detail">{{ detail }}</p>
				<template v-slot:actions>
					<icon-button @click="onCancel" icon="x" label="common.cancel" />
					<icon-button
						@click="onConfirm"
						:icon="confirmIcon"
						:label="confirmLabel"
						:type="confirmType"
					/>
				</template>
			</base-card>
		</div>
	</base-modal>
</template>

<script>
import BaseCard from '../container/base-card';
import BaseModal from './base-modal';
import IconButton from '../control/icon-button';
import './confirm-modal.css';

export default {
	components: {BaseCard, BaseModal, IconButton},
	methods: {
		onCancel() {
			this.$emit('cancel');
		},
		onConfirm() {
			this.$emit('confirm');
		}
	},
	name: 'confirm-modal',
	props: {
		confirmIcon: {
			default: 'check',
			type: String
		},
		confirmLabel: {
			default: 'common.ok',
			type: String
		},
		confirmType: {
			default: 'primary',
			type: String
		},
		detail: {
			type: String
		},
		message: {
			required: true,
			type: String
		},
		visible: {
			type: Boolean
		}
	}
};
</script>
