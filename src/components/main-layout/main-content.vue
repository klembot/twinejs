<template>
	<div class="main-content">
		<h1>{{ title }}</h1>
		<slot></slot>
	</div>
</template>

<script>
import './main-content.less';

export default {
	mounted() {
		if (this.title) {
			document.title = this.title;
		}
	},
	name: 'main-content',
	props: {
		title: String
	}
};
</script>
