<template>
	<div class="top-select">
		<top-dialog :visible="visible">
			<template v-slot:content>
				<template v-if="loadingMessage">
					<p class="loading-message">
						<icon-image name="loading-spinner" />
						{{ loadingMessage }}
					</p>
				</template>
				<template v-else>
					<p>{{ message }}</p>
					<select @change="onChangeValue">
						<option
							v-for="option in options"
							:key="option.value"
							:selected="value === option.value"
							:value="option.value"
							>{{ option.name }}</option
						>
					</select>
				</template>
			</template>
			<template v-slot:actions>
				<icon-button @click="onCancel" icon="x" label="common.cancel" raised />
				<icon-button
					@click="onSubmit"
					:disabled="loadingMessage !== undefined"
					:icon="submitIcon"
					:label="submitLabel"
					raised
					:type="submitType"
				/>
			</template>
		</top-dialog>
	</div>
</template>

<script>
import IconButton from '../input/icon-button';
import IconImage from '../icon-image';
import TopDialog from './top-dialog';
import './top-select.less';

export default {
	components: {IconButton, IconImage, TopDialog},
	data() {
		return {value: this.defaultValue};
	},
	methods: {
		onCancel() {
			this.$emit('cancel');
		},
		onChangeValue(event) {
			console.log('onChangeValue', event.target.value);
			this.value = event.target.value;
			this.$emit('change', this.value);
		},
		onSubmit() {
			this.$emit('submit', this.value);
		}
	},
	name: 'top-select',
	props: {
		defaultValue: String,
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
		visible(value) {
			if (value) {
				this.value = this.defaultValue;
			}
		}
	}
};
</script>
