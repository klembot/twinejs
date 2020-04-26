<template>
	<base-modal
		@close="onCancel"
		:classes="['prompt-modal']"
		:id="id"
		:open="open"
	>
		<template v-slot:content>
			<form @submit.prevent="onSubmit">
				<div class="prompt-container">
					<div class="icon">
						<icon-image name="help-circle" />
					</div>
					<div class="prompt">
						<p class="larger">{{ message }}</p>
						<p>
							<input
								@input="onInput"
								name="value"
								ref="textInput"
								type="text"
							/>
						</p>
					</div>
				</div>
				<p class="buttons">
					<icon-button @click="onCancel" v-t="'common.cancel'" />
					<icon-button
						button-type="submit"
						@click="onSubmit"
						:icon="submitIcon"
						:prevent-click-default="true"
						:type="submitType"
						>{{ submitLabel }}</icon-button
					>
				</p>
			</form>
		</template>
	</base-modal>
</template>

<script>
import BaseModal from './base-modal';
import IconImage from '../icon-image';
import IconButton from '../input/icon-button';
import './prompt-modal.less';

export default {
	components: {BaseModal, IconButton, IconImage},
	methods: {
		onCancel() {
			this.$emit('cancel');
		},
		onInput() {
			this.$emit('change', this.$refs.textInput.value);
		},
		onSubmit() {
			this.$emit('submit', this.$refs.textInput.value);
		}
	},
	props: {
		id: {
			required: true,
			type: String
		},
		message: {
			required: true,
			type: String
		},
		open: {
			default: false,
			type: Boolean
		},
		submitIcon: {
			default: 'check',
			type: String
		},
		submitLabel: {
			default: 'OK',
			type: String
		},
		submitType: {
			default: 'primary',
			type: String
		},
		value: {
			default: '',
			type: String
		}
	}
};
</script>
