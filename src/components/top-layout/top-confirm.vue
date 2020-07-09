<template>
	<div class="top-confirm">
		<top-dialog :visible="visible">
			<template v-slot:content>
				<div>{{ message }}</div>
			</template>
			<template v-slot:actions>
				<icon-button @click="onCancel" icon="x" label="common.cancel" raised />
				<icon-button
					@click="onConfirm"
					:icon="confirmIcon"
					:label="confirmLabel"
					raised
					:type="confirmType"
				/>
			</template>
		</top-dialog>
	</div>
</template>

<script>
import IconButton from '../input/icon-button';
import TopDialog from './top-dialog';

export default {
	components: {IconButton, TopDialog},
	methods: {
		onCancel() {
			this.$emit('cancel');
		},
		onConfirm() {
			this.$emit('confirm');
		}
	},
	name: 'top-confirm',
	props: {
		message: {
			required: true,
			type: String
		},
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
		visible: {
			type: Boolean
		}
	}
};
</script>
