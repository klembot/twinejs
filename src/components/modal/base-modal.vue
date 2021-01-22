<template>
	<portal v-if="visible">
		<div class="base-modal">
			<div class="overlay" @click="clickAway" />
			<div class="content" ref="content"><slot></slot></div>
		</div>
	</portal>
</template>

<script>
import {Portal} from '@linusborg/vue-simple-portal';
import './base-modal.css';

export default {
	components: {Portal},
	methods: {
		clickAway() {
			this.$emit('click-away');
		},
		focusContent() {
			if (!this.$refs.content) {
				this.$nextTick(() => this.focusContent());
				return;
			}

			const input = this.$refs.content.querySelector('input[type="text"]');

			if (input) {
				input.focus();
			}
		}
	},
	name: 'base-modal',
	props: {
		visible: {
			default: true,
			type: Boolean
		}
	},
	state: () => ({
		previousFocus: null
	}),
	watch: {
		visible(value) {
			if (value) {
				this.previousFocus = document.activeElement;
				this.focusContent();
			} else {
				if (this.previousFocus) {
					this.previousFocus.focus();
				}
			}
		}
	}
};
</script>
