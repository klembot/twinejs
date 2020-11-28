<template>
	<div :class="mainClasses">
		<h1 v-if="title">{{ title }}</h1>
		<slot></slot>
		<portal v-if="grabbable">
			<div
				:class="grabListenerClasses"
				@mousedown="onGrab"
				@mouseleave="onGrabEnd"
				@mouseup="onGrabEnd"
				ref="grabListener"
			></div>
		</portal>
	</div>
</template>

<script>
import {Portal} from '@linusborg/vue-simple-portal';
import domMixin from '@/util/vue-dom-mixin';
import './main-content.css';

export default {
	components: {Portal},
	computed: {
		grabListenerClasses() {
			return {
				'main-content-grab-listener': true,
				grabbing: this.grabbing
			};
		},
		mainClasses() {
			return {
				'main-content': true,
				padded: this.padded
			};
		}
	},
	data() {
		return {
			grabbing: false,
			impetus: null,
			grabbable: false,
			startGrabX: null,
			startGrabY: null,
			startScrollLeft: null,
			startScrollTop: null
		};
	},
	destroyed() {
		if (this.impetus) {
			this.impetus.destroy();
		}
	},
	methods: {
		onGrab(event) {
			this.grabbing = true;
			this.startGrabX = event.screenX;
			this.startGrabY = event.screenY;
			this.startScrollLeft = this.$el.scrollLeft;
			this.startScrollTop = this.$el.scrollTop;
			this.on(this.$refs.grabListener, 'mousemove', this.onGrabMove);
		},
		onGrabEnd() {
			this.grabbing = false;
			this.off(this.$refs.grabListener, 'mousemove', this.onGrabMove);
		},
		onGrabMove(event) {
			this.$el.scrollLeft =
				this.startScrollLeft - (event.screenX - this.startGrabX);
			this.$el.scrollTop =
				this.startScrollTop - (event.screenY - this.startGrabY);
		},
		onKeyDown(event) {
			if (
				event.target.nodeName === 'INPUT' &&
				event.target.getAttribute('type') === 'text'
			) {
				return;
			}

			if (event.keyCode === 32) {
				event.preventDefault();
				event.stopImmediatePropagation();

				if (!this.grabbable) {
					this.grabbable = true;
					this.on(document.body, 'keyup', this.onKeyUp);
				}
			}
		},
		onKeyUp(event) {
			if (event.keyCode === 32) {
				this.grabbable = false;
				this.off(document.body, 'keyup', this.onKeyUp);
				event.preventDefault();
				event.stopImmediatePropagation();
			}
		}
	},
	mixins: [domMixin],
	mounted() {
		if (this.title) {
			document.title = this.title;
		}
	},
	name: 'main-content',
	props: {
		mouseScrolling: {
			default: false,
			type: Boolean
		},
		padded: {
			default: true,
			type: Boolean
		},
		title: String
	},
	watch: {
		mouseScrolling: {
			handler(value) {
				/*
				Our first call will occur before the component is fully
				created--we need to delay processing.
				*/

				const handleValue = () => {
					if (value) {
						this.on(document.body, 'keydown', this.onKeyDown);
					} else {
						this.off(document.body, 'keydown', this.onKeyDown);
					}
				};

				if (!this.$el) {
					this.$nextTick(handleValue);
				} else {
					handleValue();
				}
			},
			immediate: true
		}
	}
};
</script>
