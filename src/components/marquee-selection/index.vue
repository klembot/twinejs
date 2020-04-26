<template>
	<div
		class="marquee-selection"
		v-if="startX !== null && startY !== null"
		:style="style"
	></div>
</template>
<script>
import domMixin from '../../util/vue-dom-mixin';
import './index.less';

export default {
	computed: {
		rect() {
			let result = {};

			if (this.startX < this.currentX) {
				result.left = this.startX;
				result.width = this.currentX - this.startX;
			} else {
				result.left = this.currentX;
				result.width = this.startX - this.currentX;
			}

			if (this.startY < this.currentY) {
				result.top = this.startY;
				result.height = this.currentY - this.startY;
			} else {
				result.top = this.currentY;
				result.height = this.startY - this.currentY;
			}

			return result;
		},
		style() {
			return {
				left: `${this.rect.left}px`,
				height: `${this.rect.height}px`,
				top: `${this.rect.top}px`,
				width: `${this.rect.width}px`
			};
		}
	},
	data: () => ({
		additive: false,
		currentX: null,
		currentY: null,
		startX: null,
		startY: null
	}),
	methods: {
		onStartDrag(event) {
			/*
			If the user is holding down shift or control, then this is an
			additive selection.
			*/

			this.additive = event.shiftKey || event.ctrlKey;
			this.startX = event.clientX + window.pageXOffset;
			this.startY = event.clientY + window.pageYOffset;
			this.currentX = this.startX;
			this.currentY = this.startY;
			this.on(window, 'mousemove', this.onFollowDrag);
			this.on(window, 'mouseup', this.onStopDrag);

			/*
			We emit an initial select event to reflect that the selection has
			begun, but with a zero-size rect. The practical effect is that to
			allow the user to click in an empty space to deselect everything.
			*/

			this.$emit('start-select', this.additive);
			this.$emit('select', {additive: this.additive, ...this.rect});

			event.preventDefault();
		},
		onFollowDrag(event) {
			this.currentX = event.clientX + window.pageXOffset;
			this.currentY = event.clientY + window.pageYOffset;
			this.$emit('select', {additive: this.additive, ...this.rect});
			event.preventDefault();
		},
		onStopDrag() {
			this.off(window, 'mousemove');
			this.off(window, 'mouseup');
			this.currentX = null;
			this.currentY = null;
			this.startX = null;
			this.startY = null;
		}
	},
	mixins: [domMixin],
	mounted() {
		/*
		This component only works in mouse-enabled environments. It would
		otherwise block the ability to scroll with a touch.
		*/

		this.on(this.$el.parentNode, 'mousedown', this.onStartDrag);
	},
	name: 'marquee-selection'
};
</script>
