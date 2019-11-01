<template>
	<div :class="classes">
		<div class="content"><slot></slot></div>
	</div>
</template>

<script>
import './raised-paper.less';

export default {
	computed: {
		classes() {
			const result = {
				['arrow-' + this.arrow]: true,
				['elevation-' + this.elevation]: true,
				focused: this.focused,
				'raised-paper': true
			};

			return result;
		}
	},
	name: 'raised-paper',
	props: {
		arrow: {
			default: 'none'
		},
		elevation: {
			default: 'low',
			type: String
		},
		tint: {
			default: ''
		}
	}
};
</script>
