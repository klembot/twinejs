<template>
	<span :class="classes">
		<label>
			<span class="label"><slot></slot></span>
			<select @change="onChange" class="text-select" ref="select">
				<option
					v-for="(option, index) in options"
					:key="option.value"
					:selected="index === selectedIndex"
					:value="option.value"
					>{{ option.label }}</option
				>
			</select>
		</label>
	</span>
</template>

<script>
import './text-select.css';

export default {
	computed: {
		classes() {
			return {
				'text-select': true,
				[`orientation-${this.orientation}`]: true
			};
		},
		selectedIndex() {
			return this.options.findIndex(option => option.value === this.value);
		}
	},
	methods: {
		onChange() {
			this.$emit('change', this.$refs.select.value);
		}
	},
	name: 'text-select',
	props: {
		options: {required: true, type: Array},
		orientation: {default: 'horizontal', type: String},
		value: {required: true, type: String}
	}
};
</script>
