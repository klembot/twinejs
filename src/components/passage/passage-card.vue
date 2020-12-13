<template>
	<div :class="classes" :style="style">
		<hover-over :visible="menuVisible">
			<div
				@mouseenter="showMenu"
				@mouseleave="hideMenu"
				@dblclick.stop="onEdit"
				@mousedown.stop="onStartDrag"
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
			<template v-slot:hover>
				<button-card>
					<div @mouseenter="showMenu" @mouseleave="hideMenu">
						<icon-button
							@click="onDelete"
							icon="trash-2"
							label="common.delete"
							type="danger"
						/>
						<icon-button @click="onEdit" icon="edit" label="common.edit" />
						<icon-button @click="onTest" icon="tool" label="common.test" />
						<icon-button icon="more-horizontal" label="common.more" />
					</div>
				</button-card>
			</template>
		</hover-over>
	</div>
</template>

<script>
// TODO: labels, emit rest of events, expand menu for more choices?

import BaseCard from '../container/base-card';
import ButtonCard from '../container/button-card';
import domMixin from '@/util/vue-dom-mixin';
import HoverOver from '../container/hover-over';
import IconButton from '../control/icon-button';
import TagStripe from '../tag/tag-stripe.vue';
import './passage-card.css';

/*
How much forgiveness to allow the user moving from the passage to the hovering
toolbar before hiding it, in milliseconds.
*/
const hoverTimeout = 250;

export default {
	components: {BaseCard, ButtonCard, HoverOver, IconButton, TagStripe},
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
				// left: this.passage.left * this.zoom + 'px',
				// top: this.passage.top * this.zoom + 'px',
				transform:
					this.offsetX !== 0 || this.offsetY !== 0
						? `translate(${this.offsetX}px, ${this.offsetY}px)`
						: undefined
			};
		}
	},
	data: () => ({
		menuVisible: false,
		menuHideTimeout: null,
		screenDragStartX: null,
		screenDragStartY: null
	}),
	methods: {
		hideMenu() {
			if (!this.menuHideTimeout) {
				this.menuHideTimeout = window.setTimeout(() => {
					this.menuVisible = false;
					this.menuHideTimeout = null;
				}, hoverTimeout);
			}
		},
		onDelete() {
			this.$emit('delete', this.passage);
		},
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

			this.hideMenu();

			/*
			Shift- or control-clickfing toggles our selected status, but doesn't
			affect any other passage's selected status. If the shift or control
			key was not held down, select only ourselves.
			*/

			if (event.shiftKey || event.ctrlKey) {
				this.$emit('select-inclusive');
			} else {
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
		onStopDrag(e) {
			const isTouchEvent = event.type === 'touchstart';

			/* Only listen to the left mouse button. */

			if (event.type === 'mouseup' && e.which !== 1) {
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
				if (!(e.ctrlKey || e.shiftKey)) {
					this.$emit('select-exclusive');
				}
			}

			/*
			touchend events do not include client coordinates, but mouseup
			events do.
			*/

			if (e.type === 'mouseup') {
				this.$emit(
					'drag-stop',
					e.clientX + window.pageXOffset - this.screenDragStartX,
					e.clientY + window.pageYOffset - this.screenDragStartY
				);
			} else {
				this.$emit('drag-stop', this.screenDragOffsetX, this.screenDragOffsetY);
			}
		},
		onTest() {
			this.$emit('test', this.passage);
		},
		showMenu() {
			this.menuVisible = true;

			if (this.menuHideTimeout) {
				window.clearTimeout(this.menuHideTimeout);
				this.menuHideTimeout = null;
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
