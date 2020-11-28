<template>
	<button
		@click="onClick"
		:class="classes"
		:disabled="disabled"
		:type="buttonType"
	>
		<icon-image v-if="icon" :name="icon" />
		<span v-if="label" v-t="label" />
		<span><slot></slot></span>
	</button>
</template>

<script>
import IconImage from '../icon-image';
import 'focus-visible';
import './icon-button-link.css';

export default {
	components: {IconImage},
	computed: {
		classes() {
			return {
				'icon-button': true,
				[`icon-position-${this.iconPosition}`]: true,
				[`type-${this.type}`]: true
			};
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
		stopClickPropagation: {default: false, type: Boolean},
		type: {
			default: 'secondary',
			validator: value =>
				['create', 'danger', 'primary', 'secondary'].includes(value)
		}
	}
};
</script>
