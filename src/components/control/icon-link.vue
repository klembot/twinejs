<template>
	<a :class="classes" :href="href"
		><icon-image :name="icon" />
		<span v-if="label" v-t="label" />
		<slot></slot>
	</a>
</template>
<script>
import IconImage from '../icon-image';
import './icon-button-link.css';

export default {
	components: {IconImage},
	computed: {
		classes() {
			return {
				active: this.active,
				'icon-link': true,
				'icon-only': this.iconOnly,
				[`icon-position-${this.iconPosition}`]: true,
				raised: this.raised,
				[`type-${this.type}`]: true
			};
		},
		iconOnly() {
			return !this.$slots.default && !this.label;
		}
	},
	name: 'icon-link',
	props: {
		href: {
			required: true,
			type: String
		},
		icon: String,
		label: String,
		raised: {
			default: false,
			type: Boolean
		},
		type: String
	}
};
</script>
