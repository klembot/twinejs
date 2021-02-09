<template>
	<div
		:class="classes"
		@dblclick.stop="onEdit"
		@mousedown.stop="onStartDrag"
		:style="style"
	>
		<base-card
			compact
			:highlighted="passage.highlighted"
			:selected="passage.selected"
			:style="dimensions"
		>
			<template v-slot:header>
				<tag-stripe :tagColors="tagColors" :tags="passage.tags" />
				{{ passage.name }}
			</template>
			<div class="excerpt" v-if="showExcerpt">{{ excerpt }}</div>
		</base-card>
	</div>
</template>

<script>
import BaseCard from '../container/base-card';
import domMixin from '@/util/vue-dom-mixin';
import TagStripe from '../tag/tag-stripe.vue';
import './passage-card.css';

export default {
	components: {BaseCard, TagStripe},
	computed: {
		classes() {
			return {
				highlighted: this.highlighted,
				'name-only': !this.showExcerpt,
				'passage-card': true,
				selected: this.selected
			};
		},
		dimensions() {
			return {
				height: this.passage.height + 'px',
				width: this.passage.width + 'px'
			};
		},
		excerpt() {
			if (this.passage.text.length < 100) {
				return this.passage.text;
			}

			return this.passage.text.substr(0, 100) + '…';
		},
		style() {
			return {
				...this.dimensions,
				left: this.passage.left + 'px',
				top: this.passage.top + 'px',
				transform:
					this.offsetX !== 0 || this.offsetY !== 0
						? `translate(${this.offsetX}px, ${this.offsetY}px)`
						: undefined
			};
		}
	},
	data: () => ({
		screenDragStartX: null,
		screenDragStartY: null
	}),
	methods: {
		onEdit() {
			this.$emit('edit', this.passage);
		},
		onStartDrag(event) {
			const isTouchEvent = event.type === 'touchstart';

			/*
			Only listen to the left mouse button.
			*/

			if (!isTouchEvent && event.which !== 1) {
				return;
			}

			/*
			Shift- or control-clicking toggles our selected status, but doesn't affect
			any other passage's selected status. If the shift or control key was not
			held down and we were not already selected, we know the user wants to
			select only this passage.
			*/

			if (event.shiftKey || event.ctrlKey) {
				this.$emit(this.passage.selected ? 'deselect' : 'select-inclusive');
			} else if (!this.passage.selected) {
				this.$emit('select-exclusive');
			}

			/* Begin tracking a potential drag. */

			const srcPoint = isTouchEvent ? event.touches[0] : event;

			this.screenDragStartX = srcPoint.clientX + window.pageXOffset;
			this.screenDragStartY = srcPoint.clientY + window.pageYOffset;

			if (isTouchEvent) {
				this.on(window, 'touchmove', this.onFollowDrag, {passive: false});
				this.on(window, 'touchend', this.onStopDrag);
			} else {
				this.on(window, 'mousemove', this.onFollowDrag, {passive: false});
				this.on(window, 'mouseup', this.onStopDrag);
			}

			document.querySelector('body').classList.add('dragging-passages');
		},
		onFollowDrag(event) {
			const srcPoint = event.type === 'mousemove' ? event : event.touches[0];

			this.$emit(
				'drag',
				srcPoint.clientX + window.pageXOffset - this.screenDragStartX,
				srcPoint.clientY + window.pageYOffset - this.screenDragStartY
			);

			/*
			Block scrolling if we're following touch events -- otherwise, the
			browser will treat it as though the user is dragging to scroll
			around the screen.
			*/

			if (event.type === 'touchmove') {
				event.preventDefault();
			}
		},
		onStopDrag(event) {
			const isTouchEvent = event.type === 'touchstart';

			/* Only listen to the left mouse button. */

			if (event.type === 'mouseup' && event.which !== 1) {
				return;
			}

			/* Remove event listeners set up at the start of the drag. */

			if (isTouchEvent) {
				this.off(window, 'touchmove');
				this.off(window, 'touchend');
			} else {
				this.off(window, 'mousemove');
				this.off(window, 'mouseup');
			}

			document.querySelector('body').classList.remove('dragging-passages');

			/*
			If we haven't actually been moved and the shift or control key were
			not held down, select just this passage only. This handles the
			scenario where the user clicks a single passage when several were
			selected. We don't want to immediately deselect them all, as the
			user may be starting a drag; but now that we know for sure that the
			user didn't intend this, we select just this one.
			*/

			if (this.dragXOffset === 0 && this.dragYOffset === 0) {
				if (!(event.ctrlKey || event.shiftKey)) {
					this.$emit('select-exclusive');
				}
			}

			/*
			touchend events do not include client coordinates, but mouseup
			events do.
			*/

			if (event.type === 'mouseup') {
				this.$emit(
					'drag-stop',
					event.clientX + window.pageXOffset - this.screenDragStartX,
					event.clientY + window.pageYOffset - this.screenDragStartY
				);
			} else {
				this.$emit('drag-stop', this.screenDragOffsetX, this.screenDragOffsetY);
			}
		}
	},
	mixins: [domMixin],
	name: 'passage-item',
	props: {
		offsetX: {default: 0, type: Number},
		offsetY: {default: 0, type: Number},
		passage: {required: true, type: Object},
		showExcerpt: {default: true, type: Boolean},
		tagColors: {required: true, type: Object},
		zoom: {required: true, type: Number}
	}
};
</script>
