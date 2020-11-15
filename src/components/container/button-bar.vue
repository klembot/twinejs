<template>
	<div :class="classes"><slot></slot></div>
</template>

<script>
import './button-bar.css';

export default {
	computed: {
		classes() {
			return {
				'button-bar': true,
				[`orientation-${this.orientation}`]: true
			};
		}
	},
	name: 'button-bar',
	props: {
		orientation: {
			default: 'horizontal',
			type: String,
			validator: value => ['horizontal', 'vertical'].includes(value)
		}
	}
};
</script>
