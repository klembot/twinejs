<template>
	<span :class="classes">
		<label>
			<span class="label"><slot></slot></span>
			<select @change="onChange" class="text-select" ref="select">
				<option
					v-for="(option, index) in options"
					:key="option"
					:selected="index === selectedIndex"
					>{{ option }}</option
				>
			</select>
		</label>
	</span>
</template>

<script>
import './text-select.less';

export default {
	computed: {
		classes() {
			return {
				'text-select': true,
				[`orientation-${this.orientation}`]: true
			};
		},
		selectedIndex() {
			return this.options.indexOf(this.value);
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
