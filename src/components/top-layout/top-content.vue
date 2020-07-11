<template>
	<div class="top-content">
		<h1>{{ title }}</h1>
		<slot></slot>
	</div>
</template>

<script>
import './top-content.less';

export default {
	mounted() {
		if (this.title) {
			document.title = this.title;
		}
	},
	name: 'top-content',
	props: {
		title: String
	}
};
</script>
