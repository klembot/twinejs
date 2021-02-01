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
	data() {
		return {keyUpListener: null};
	},
	destroyed() {
		if (this.keyUpListener) {
			window.removeEventListener('keyup', this.keyUpListener);
		}
	},
	methods: {
		clickAway() {
			this.$emit('close');
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
		},
		onKeyUp(event) {
			if (event.key === 'Escape') {
				this.$emit('close');
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
				this.keyUpListener = window.addEventListener('keyup', event =>
					this.onKeyUp(event)
				);
				window.addEventListener('keyup', this.keyUpListener);
			} else {
				if (this.previousFocus) {
					this.previousFocus.focus();
				}

				window.removeEventListener('keyup', this.keyUpListener);
			}
		}
	}
};
</script>
