<template>
	<div class="hover-over">
		<div class="default-container" ref="default"><slot></slot></div>
		<portal v-if="visible">
			<div class="hover-over-hover-container" ref="hover">
				<slot name="hover"></slot>
			</div>
		</portal>
	</div>
</template>

<script>
import {createPopper} from '@popperjs/core';
import {Portal} from '@linusborg/vue-simple-portal';
import './hover-over.css';

export default {
	beforeDestroy() {
		if (this.popper) {
			this.popper.destroy();
		}

		if (this.boundClickListener) {
			document.removeEventListener('click', this.boundClickListener);
		}
	},
	components: {Portal},
	data: () => ({
		boundClickListener: null,
		oldFocus: null,
		popper: null
	}),
	methods: {
		createPopper() {
			/*
			Our refs may not be in the DOM yet.
			*/

			if (!this.$refs.default || !this.$refs.hover || !this.$refs.hover) {
				this.$nextTick(() => this.createPopper());
				return;
			}

			this.popper = createPopper(this.$refs.default, this.$refs.hover, {
				modifiers: [{name: 'flip', enabled: this.allowFlip}],
				placement: this.position,
				strategy: 'fixed'
			});

			const firstInput = this.$refs.hover.querySelector('input');

			if (firstInput) {
				this.oldFocus = document.activeElement;
				firstInput.focus();
			}
		},
		destroyPopper() {
			if (this.popper) {
				this.popper.destroy();
			} else {
				console.warn(
					'destroyPopper() called, but this.popper is undefined; ignoring'
				);
			}

			if (this.oldFocus) {
				this.oldFocus.focus();
				this.oldFocus = null;
			}
		},
		clickListener(event) {
			let target = event.target;

			while (
				target &&
				target !== this.$refs.default &&
				target !== this.$refs.hover
			) {
				target = target.parentNode;
			}

			if (target !== this.$refs.default && target !== this.$refs.hover) {
				this.$emit('click-away');
			}
		}
	},
	props: {
		allowFlip: {
			default: false,
			type: Boolean
		},
		position: {
			default: 'bottom',
			validator: value => ['bottom', 'left', 'right', 'top'].includes(value)
		},
		visible: {
			default: true,
			type: Boolean
		}
	},
	watch: {
		visible: {
			handler(value) {
				if (value) {
					this.createPopper();
					this.boundClickListener = event => this.clickListener(event);
					document.addEventListener('click', this.boundClickListener);
				} else {
					this.destroyPopper();
					document.removeEventListener('click', this.boundClickListener);
				}
			},
			immediate: true
		}
	}
};
</script>
