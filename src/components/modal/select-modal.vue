<template>
	<base-modal @click-away="onCancel" :visible="visible">
		<div class="select-modal">
			<base-card>
				<template v-slot:header>{{ message }}</template>
				<p class="loading-message" v-if="loadingMessage">
					<icon-image name="loading-spinner" />
					{{ loadingMessage }}
				</p>
				<template v-else>
					<text-select
						@change="onChangeValue"
						:options="options"
						orientation="vertical"
						:value="value"
						>{{ detail }}</text-select
					>
				</template>
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
import IconImage from '../icon-image';
import TextSelect from '../control/text-select';
import './select-modal.css';

export default {
	components: {BaseCard, BaseModal, IconButton, IconImage, TextSelect},
	data() {
		return {value: this.defaultValue};
	},
	methods: {
		onCancel() {
			this.$emit('cancel');
		},
		onChangeValue(value) {
			this.value = value;
			this.$emit('change', this.value);
		},
		onSubmit() {
			this.$emit('submit', this.value);
		}
	},
	name: 'select-modal',
	props: {
		defaultValue: String,
		detail: {
			type: String
		},
		loadingMessage: {
			type: String
		},
		message: {
			required: true,
			type: String
		},
		options: {
			required: true,
			type: Array
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
		defaultValue() {
			if (!this.value) {
				this.value = this.defaultValue;
			}
		},
		loadingMessage(value) {
			if (!value) {
				this.value = this.defaultValue;
			}
		},
		visible(value) {
			if (value) {
				this.value = this.defaultValue;
			}
		}
	}
};
</script>
