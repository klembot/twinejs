<template>
	<portal v-if="visible">
		<div class="base-modal">
			<div class="overlay" @click="clickAway" />
			<div
				:aria-describedby="ariaDescriptionId"
				:aria-labelledby="ariaLabelId"
				class="content"
				ref="content"
				role="modal"
			>
				<slot></slot>
			</div>
		</div>
	</portal>
</template>

<script>
import {Portal} from '@linusborg/vue-simple-portal';
import domMixin from '../../util/vue-dom-mixin';
import './base-modal.css';

export default {
	components: {Portal},
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
	mixins: [domMixin],
	name: 'base-modal',
	props: {
		ariaDescriptionId: {type: String},
		ariaLabelId: {required: true, type: String},
		visible: {default: true, type: Boolean}
	},
	state: () => ({
		previousFocus: null
	}),
	watch: {
		visible(value) {
			if (value) {
				this.previousFocus = document.activeElement;
				this.focusContent();
				this.on(document.body, 'keyup', event => {
					if (event.key === 'Escape') {
						this.$emit('close');
					}
				});
			} else {
				if (this.previousFocus) {
					this.previousFocus.focus();
				}

				this.off(document.body, 'keyup');
			}
		}
	}
};
</script>
