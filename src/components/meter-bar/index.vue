<template>
	<div :class="classes">
		<div class="meter">
			<span
				class="filled"
				v-bind:style="{width: indeterminate ? '100%' : percent + '%'}"
			></span>
		</div>
		<div class="label">
			<slot></slot>
		</div>
	</div>
</template>

<script>
import './index.css';

export default {
	computed: {
		classes() {
			return {'meter-bar': true, indeterminate: this.indeterminate};
		}
	},
	name: 'meter-bar',
	props: {
		indeterminate: {default: false, type: Boolean},
		percent: {default: 0, type: Number}
	}
};
</script>
