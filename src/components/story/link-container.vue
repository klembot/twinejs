<template>
	<svg class="link-container" :style="style">
		<!-- https://developer.mozilla.org/en-US/docs/Web/SVG/Element/marker -->
		<defs>
			<marker
				id="link-arrowhead"
				refX="6"
				refY="4"
				markerWidth="8"
				markerHeight="8"
				orient="auto"
			>
				<path d="M 1,1 7,4 1,7 Z" />
			</marker>
			<marker
				id="link-broken"
				refX="4.5"
				refY="4.5"
				markerWidth="10"
				markerHeight="10"
			>
				<path d="M 1,2 2,1 5,4 8,1 9,2 6,5 9,8 8,9, 5,6 2,9 1,8 4,5 Z" />
			</marker>
		</defs>
		<slot></slot>
	</svg>
</template>
<script>
import './link-container.less';

export default {
	computed: {
		style() {
			/*
			In order for the arrows to not get cut off, we have to overinflate
			our base size when scaling. It's possible to do this with an SVG
			transform instead but it seems to yield weird results -- lines not
			appearing, for example. Not sure if there are performance or
			appearance implications to either approach.
			*/

			return {
				transform: 'scale(' + this.zoom + ')',
				width: (100 * 1) / this.zoom + '%',
				height: (100 * 1) / this.zoom + '%'
			};
		}
	},
	props: {
		zoom: {
			required: true,
			type: Number
		}
	}
};
</script>
