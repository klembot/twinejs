<template>
	<div :class="classes" :style="style">
		<anchored-paper :visible="menuVisible">
			<template v-slot:anchor>
				<div
					@dblclick.stop="onEdit"
					@mousedown.stop="onStartDrag"
					@mouseenter="showMenu"
					@mouseleave="hideMenu"
				>
					<raised-paper class="fill">
						<div class="stack padded close vertical">
							<div class="name">{{ passage.name }}</div>
							<div class="excerpt">{{ excerpt }}</div>
						</div>
					</raised-paper>
				</div>
			</template>
			<template v-slot:paper>
				<div class="stack tight vertical">
					<icon-button icon="edit" type="flat" v-t="common.edit" />
					<icon-button
						icon="tool"
						type="flat"
						v-t="components.passageItem.test"
					/>
					<icon-button icon="trash-2" type="flat" v-t="common.delete" />
				</div>
			</template>
		</anchored-paper>
	</div>
</template>

<script>
import AnchoredPaper from '../surface/anchored-paper';
import IconButton from '../input/icon-button';
import RaisedPaper from '../surface/raised-paper';
import {describe as describeZoom} from '@/util/zoom-levels';
import domMixin from '@/util/vue-dom-mixin';
import './passage-item.less';

export default {
	components: {AnchoredPaper, IconButton, RaisedPaper},
	computed: {
		classes() {
			const result = ['passage-item', `zoom-${describeZoom(this.zoom)}`];

			if (this.passage.highlighted) {
				result.push('highlighted');
			}

			if (this.passage.selected) {
				result.push('selected');
			}

			return result;
		},
		excerpt() {
			if (this.passage.text.length < 50) {
				return this.passage.text;
			}

			return this.passage.text.substr(0, 50) + '…';
		},
		style() {
			return {
				height: this.passage.height * this.zoom + 'px',
				left: this.passage.left * this.zoom + 'px',
				top: this.passage.top * this.zoom + 'px',
				width: this.passage.width * this.zoom + 'px',
				transform:
					this.offsetX !== 0 || this.offsetY !== 0
						? `translate(${this.offsetX}px, ${this.offsetY}px)`
						: undefined
			};
		}
	},
	data: () => ({
		menuVisible: false,
		screenDragStartX: null,
		screenDragStartY: null
	}),
	methods: {
		hideMenu() {
			this.menuVisible = false;
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
		showMenu() {
			console.log('show menu');
			this.menuVisible = true;
		}
	},
	mixins: [domMixin],
	name: 'passage-item',
	props: {
		offsetX: {
			default: 0,
			type: Number
		},
		offsetY: {
			default: 0,
			type: Number
		},
		passage: {
			required: true,
			type: Object
		},
		zoom: {
			required: true,
			type: Number
		}
	}
};
</script>
