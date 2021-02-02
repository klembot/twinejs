<template>
	<base-modal :ariaLabelId="ariaLabelId" @close="onCancel" :visible="visible">
		<div class="prompt-modal">
			<form>
				<base-card>
					<template v-slot:header
						><span :id="ariaLabelId">{{ message }}</span></template
					>
					<text-line
						@input="onChangeValue"
						orientation="vertical"
						:value="value"
					>
						{{ detail }}</text-line
					>
					<p v-if="errorMessage">
						<error-message>{{ errorMessage }}</error-message>
					</p>
					<template v-slot:actions>
						<icon-button @click="onCancel" icon="x" label="common.cancel" />
						<icon-button
							buttonType="submit"
							@click="onSubmit"
							:disabled="!!errorMessage"
							:icon="submitIcon"
							:label="submitLabel"
							:type="submitType"
						/>
					</template>
				</base-card>
			</form>
		</div>
	</base-modal>
</template>

<script>
import BaseCard from '../container/base-card';
import BaseModal from './base-modal';
import ErrorMessage from '../message/error-message';
import IconButton from '../control/icon-button';
import TextLine from '../control/text-line';
import './prompt-modal.css';

export default {
	components: {BaseCard, BaseModal, ErrorMessage, IconButton, TextLine},
	computed: {
		ariaLabelId() {
			return this.domId + '-header';
		},
		errorMessage() {
			if (this.validate) {
				return this.validate(this.value);
			}

			return undefined;
		}
	},
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
		detail: {type: String},
		domId: {required: true, type: String},
		message: {required: true, type: String},
		submitIcon: {default: 'check', type: String},
		submitLabel: {default: 'common.ok', type: String},
		submitType: {default: 'primary', type: String},
		validate: {type: Function},
		visible: {type: Boolean}
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
