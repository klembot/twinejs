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
			return {
				['arrow-' + this.arrow]: true,
				['elevation-' + this.elevation]: true,
				highlighted: this.highlighted,
				'raised-paper': true,
				selected: this.selected && this.arrow === 'none'
			};
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
		highlighted: {
			default: false,
			type: Boolean
		},
		selected: {
			default: false,
			type: Boolean
		}
	}
};
</script>
