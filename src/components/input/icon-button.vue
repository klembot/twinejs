<template>
	<button
		@click="onClick"
		:class="classes"
		:disabled="disabled"
		:type="buttonType"
	>
		<icon-image v-if="icon" :name="icon" />
		<span v-if="label" v-t="label" />
		<slot></slot>
	</button>
</template>

<script>
import IconImage from '../icon-image';
import 'focus-visible';
import './icon-button-link.less';

export default {
	components: {IconImage},
	computed: {
		classes() {
			return {
				active: this.active,
				'icon-button': true,
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
	methods: {
		onClick(e) {
			this.$emit('click');

			if (this.preventClickDefault) {
				e.preventDefault();
			}

			if (this.stopClickPropagation) {
				e.stopPropagation();
			}
		}
	},
	name: 'icon-button',
	props: {
		active: {default: false, type: Boolean},
		buttonType: {default: 'button', type: String},
		disabled: {default: false, type: Boolean},
		icon: String,
		iconPosition: {
			default: 'start',
			validator: value => ['start', 'end'].includes(value)
		},
		label: {type: String},
		preventClickDefault: {default: false, type: Boolean},
		raised: {default: false, type: Boolean},
		stopClickPropagation: {default: false, type: Boolean},
		type: {
			default: 'default',
			validator: value =>
				['create', 'danger', 'default', 'primary'].includes(value)
		}
	}
};
</script>
