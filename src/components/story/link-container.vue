<template>
	<svg class="link-container">
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
import './link-container.css';

export default {
	name: 'link-container'
};
</script>
