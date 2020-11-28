<template>
	<label class="text-checkbox">
		<icon-image :name="checked ? 'check-square' : 'square'" />
		<input
			@change="onChange"
			:checked="checked"
			class="screen-reader-only"
			type="checkbox"
		/>
		<span v-if="label" v-t="label" />
		<slot></slot>
	</label>
</template>

<script>
import IconImage from '../icon-image';
import './text-checkbox.css';

export default {
	components: {IconImage},
	methods: {
		onChange(event) {
			this.$emit('change', event.target.checked);
		}
	},
	name: 'text-checkbox',
	props: {
		checked: {type: Boolean},
		label: {type: String}
	}
};
</script>
