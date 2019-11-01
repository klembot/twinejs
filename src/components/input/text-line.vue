<template>
	<span :class="classes">
		<label>
			<span class="label"><slot></slot></span>
			<input
				@change="onChange"
				@input="onInput"
				:placeholder="placeholder"
				type="text"
			/>
		</label>
	</span>
</template>

<script>
import './text-line.less';

export default {
	computed: {
		classes() {
			return {
				'text-line': true,
				[`label-position-${this.labelPosition}`]: true
			};
		}
	},
	methods: {
		onChange(event) {
			this.$emit('change', event.target.value);
		},
		onInput(event) {
			this.$emit('input', event.target.value);
		}
	},
	props: {
		labelPosition: {
			default: 'horizontal',
			type: String,
			validator: value => ['horizontal', 'vertical'].includes(value)
		},
		placeholder: {
			type: String
		},
		value: {
			default: '',
			type: String
		}
	}
};
</script>
