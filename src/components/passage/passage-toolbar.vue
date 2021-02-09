<template>
	<div class="passage-toolbar-target-container" :style="targetContainerStyle">
		<hover-over allow-flip :visible="!forceInvisible && passages.length > 0">
			<div aria-hidden class="passage-toolbar-target" :style="targetStyle" />
			<template v-slot:hover>
				<div :class="toolbarClasses">
					<button-card>
						<button-bar>
							<icon-button
								@click="onTest"
								:disabled="passages.length > 1"
								icon="tool"
								label="common.test"
							/>
							<icon-button
								@click="onEdit"
								:disabled="passages.length > 1"
								icon="edit"
								label="common.edit"
							/>
							<icon-button @click="onDelete" icon="trash-2" type="danger">
								<span v-if="passages.length === 1" v-t="'common.delete'" />
								<span
									v-else
									v-t="{
										path: 'common.deleteCount',
										args: {count: passages.length}
									}"
								/>
							</icon-button>
						</button-bar>
					</button-card>
				</div>
			</template>
		</hover-over>
	</div>
</template>

<script>
import ButtonBar from '../container/button-bar';
import ButtonCard from '../container/button-card';
import HoverOver from '../container/hover-over';
import IconButton from '../control/icon-button';
import './passage-toolbar.css';

export default {
	components: {ButtonBar, ButtonCard, HoverOver, IconButton},
	computed: {
		target() {
			if (this.passages.length === 0) {
				return {};
			}

			if (this.passages.length === 1) {
				return {
					height: this.passages[0].height * this.zoom,
					left: this.passages[0].left * this.zoom,
					top: this.passages[0].top * this.zoom,
					width: this.passages[0].width * this.zoom
				};
			}

			/* Target the center of the selection. */

			let minX = Number.POSITIVE_INFINITY;
			let maxX = Number.NEGATIVE_INFINITY;
			let minY = Number.POSITIVE_INFINITY;
			let maxY = Number.NEGATIVE_INFINITY;

			this.passages.forEach(passage => {
				if (passage.top < minY) {
					minY = passage.top;
				}

				if (passage.top + passage.height > maxY) {
					maxY = passage.top + passage.height;
				}

				if (passage.left < minX) {
					minX = passage.left;
				}

				if (passage.left + passage.width > maxX) {
					maxX = passage.left + passage.width;
				}
			});

			return {
				height: 0,
				left: (minX + (maxX - minX) / 2) * this.zoom,
				top: (minY + (maxY - minY) / 2) * this.zoom,
				width: 0
			};
		},
		targetContainerStyle() {
			return {
				height: `${this.target.height}px`,
				left: `${this.target.left}px`,
				top: `${this.target.top}px`,
				width: `${this.target.width}px`
			};
		},
		targetStyle() {
			return {
				height: `${this.target.height}px`,
				width: `${this.target.width}px`
			};
		},
		toolbarClasses() {
			return {
				'passage-toolbar': true,
				single: this.passages.length === 1
			};
		}
	},
	data() {
		return {forceInvisible: false};
	},
	methods: {
		onDelete() {
			this.$emit('delete', this.passages);
		},
		onEdit() {
			this.$emit('edit', this.passages[0]);
		},
		onTest() {
			this.$emit('test', this.passages[0]);
		}
	},
	name: 'passage-toolbar',
	props: {
		passages: {type: Array},
		zoom: {required: true, type: Number}
	},
	watch: {
		target() {
			/*
			Force <hover-over> to reposition onscreen. We need to wait until any
			passage drag is done.
			*/

			this.forceInvisible = true;

			const resetter = () => {
				if (document.body.classList.contains('dragging-passages')) {
					window.setTimeout(resetter, 25);
					return;
				}

				this.forceInvisible = false;
			};

			this.$nextTick(resetter);
		}
	}
};
</script>
