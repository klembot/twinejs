<template>
	<base-modal @click-away="onCancel" :visible="visible">
		<div class="prompt-modal">
			<base-card>
				<template v-slot:header>{{ message }}</template>
				<text-line
					@change="onChangeValue"
					orientation="vertical"
					:value="value"
				>
					{{ detail }}</text-line
				>
				<template v-slot:actions>
					<icon-button @click="onCancel" icon="x" label="common.cancel" />
					<icon-button
						@click="onSubmit"
						:icon="submitIcon"
						:label="submitLabel"
						:type="submitType"
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
import TextLine from '../control/text-line';
import './prompt-modal.css';

export default {
	components: {BaseCard, BaseModal, IconButton, TextLine},
	data() {
		return {value: this.defaultValue};
	},
	methods: {
		onCancel() {
			this.$emit('cancel');
		},
		onChangeValue(newValue) {
			this.value = newValue;
			this.$emit('change', newValue);
		},
		onSubmit() {
			this.$emit('submit', this.value);
		}
	},
	name: 'prompt-modal',
	props: {
		defaultValue: String,
		detail: {
			type: String
		},
		message: {
			required: true,
			type: String
		},
		submitIcon: {
			default: 'check',
			type: String
		},
		submitLabel: {
			default: 'common.ok',
			type: String
		},
		submitType: {
			default: 'primary',
			type: String
		},
		visible: {
			type: Boolean
		}
	},
	watch: {
		visible(value) {
			if (value) {
				this.value = this.defaultValue;
			}
		}
	}
};
</script>
