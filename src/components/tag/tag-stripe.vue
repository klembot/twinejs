<template>
	<div class="tag-stripe">
		<span
			v-for="stripe in stripes"
			:class="`color-${stripe.color}`"
			:key="stripe.name"
			:title="stripe.name"
		/>
	</div>
</template>

<script>
import './tag-stripe.css';

export default {
	computed: {
		stripes() {
			return this.tags.reduce((result, name) => {
				const color = this.tagColors[name];

				if (color) {
					result.push({color, name});
				}

				return result;
			}, []);
		}
	},
	name: 'tag-stripe',
	props: {
		tagColors: {required: true, type: Object},
		tags: {type: Array}
	}
};
</script>
