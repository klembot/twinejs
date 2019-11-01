<template>
	<div class="anchored-paper">
		<div class="anchor" ref="anchor"><slot name="anchor"></slot></div>
		<portal v-if="visible">
			<raised-paper
				:arrow="arrowPosition"
				class="anchored-paper-raised-paper"
				elevation="high"
				ref="paper"
				><slot name="paper"></slot></raised-paper
		></portal>
	</div>
</template>

<script>
import {createPopper} from '@popperjs/core';
import {Portal} from '@linusborg/vue-simple-portal';
import PlacementWatcher from '@/util/popper-placement-watcher';
import RaisedPaper from './raised-paper';
import './anchored-paper.less';

const popperPositions = {
	bottom: 'top',
	left: 'right',
	right: 'left',
	top: 'bottom'
};

export default {
	beforeDestroy() {
		if (this.popper) {
			this.popper.destroy();
		}
	},
	components: {Portal, RaisedPaper},
	data: () => ({
		arrowPosition: null,
		oldFocus: null,
		popper: null
	}),
	methods: {
		createPopper() {
			/*
			Our refs may not be in the DOM yet.
			*/

			if (!this.$refs.anchor || !this.$refs.paper || !this.$refs.paper.$el) {
				this.$nextTick(() => this.createPopper());
				return;
			}

			this.popper = createPopper(this.$refs.anchor, this.$refs.paper.$el, {
				modifiers: [
					new PlacementWatcher(
						pos => (this.arrowPosition = popperPositions[pos])
					),
					{
						name: 'flip',
						enabled: this.allowFlip
					}
				],
				placement: this.position,
				strategy: 'fixed'
			});

			const firstInput = this.$refs.paper.$el.querySelector('input');

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
		visible(value) {
			if (value) {
				this.createPopper();
			} else {
				this.destroyPopper();
			}
		}
	}
};
</script>
