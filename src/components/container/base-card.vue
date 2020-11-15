<template>
	<div :class="classes">
		<div class="image" v-if="$slots.image"><slot name="image"></slot></div>
		<div class="body">
			<div class="header" v-if="$slots.header">
				<slot name="header"></slot>
			</div>
			<div class="content">
				<slot></slot>
			</div>
			<div class="actions" v-if="$slots.actions">
				<slot name="actions"></slot>
			</div>
		</div>
	</div>
</template>

<script>
import '../../styles/animations.css';
import './base-card.css';

export default {
	computed: {
		classes() {
			return {
				'base-card': true,
				compact: this.compact,
				highlighted: this.highlighted,
				[`image-position-${this.imagePosition}`]: true,
				selected: this.selected
			};
		}
	},
	name: 'base-card',
	props: {
		compact: {
			type: Boolean
		},
		highlighted: {
			type: Boolean
		},
		image: {
			type: String
		},
		imageAlt: {
			type: String
		},
		imagePosition: {
			default: 'vertical',
			validator(value) {
				return ['horizontal', 'vertical'].includes(value);
			}
		},
		selected: {
			type: Boolean
		}
	}
};
</script>
