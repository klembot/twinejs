<template>
	<span :class="classes">
		<label>
			<span class="label"><slot></slot></span>
			<input
				@change="onChange"
				@input="onInput"
				:placeholder="placeholder"
				:value="value"
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
				[`orientation-${this.orientation}`]: true
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
		orientation: {
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
