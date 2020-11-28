<template>
	<div aria-hidden class="graph-paper" :style="style" />
</template>
<script>
import './graph-paper.css';

export default {
	computed: {
		style() {
			/* Note that we have four backgrounds, one for each set of lines. */

			const major = 100 * this.zoom;
			const minor = 25 * this.zoom;

			return {
				backgroundSize: `${major}px ${major}px, ${major}px ${major}px, ${minor}px ${minor}px, ${minor}px ${minor}px`,
				height: this.height + 'px',
				width: this.width + 'px'
			};
		}
	},
	name: 'graph-paper',
	props: {
		zoom: {
			default: 1,
			type: Number
		}
	}
};
</script>
