<template>
	<div class="card-group" :style="style"><slot></slot></div>
</template>

<script>
import './card-group.css';

export default {
	computed: {
		style() {
			return {
				'max-width': this.maxWidth,
				'grid-template-columns': this.columnWidth
					? `repeat(auto-fit, ${this.columnWidth})`
					: `repeat(${this.columnCount}, 1fr)`
			};
		}
	},
	name: 'card-group',
	props: {
		columnCount: {
			default: 4,
			type: Number
		},
		columnWidth: {
			type: String
		},
		maxWidth: {
			default: 'auto',
			type: String
		}
	}
};
</script>
