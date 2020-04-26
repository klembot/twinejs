<template>
	<a :class="`icon-link ${type}`" :href="href"
		><icon-image :name="icon"/><slot></slot
	></a>
</template>
<script>
import IconImage from '../icon-image';
import './icon-button-link.less';

export default {
	components: {IconImage},
	name: 'icon-link',
	props: {
		href: {
			required: true,
			type: String
		},
		icon: String,
		type: String
	}
};
</script>
