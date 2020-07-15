<template>
	<div class="top-prompt">
		<top-dialog :visible="visible">
			<template v-slot:content>
				<text-line
					@change="onChangeValue"
					orientation="vertical"
					:value="value"
				>
					{{ message }}</text-line
				>
			</template>
			<template v-slot:actions>
				<icon-button @click="onCancel" icon="x" label="common.cancel" raised />
				<icon-button
					@click="onSubmit"
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
import TextLine from '../input/text-line';
import TopDialog from './top-dialog';

export default {
	components: {IconButton, TextLine, TopDialog},
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
	name: 'top-prompt',
	props: {
		defaultValue: String,
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
