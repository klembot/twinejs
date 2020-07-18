/*
Manages animating zoom transitions. This provides a single data attribute,
apparentZoom, which the rest of the component should use as the zoom level when
rendering.
*/

import {easeInOutQuad} from 'tween-functions';

export default {
	data() {
		return {
			apparentZoom: null,
			zoomTransition: {
				duration: null,
				elapsed: null,
				lastTime: null,
				scrollCenterRatio: {
					left: null,
					top: null
				},
				startZoom: null,
				endZoom: null
			}
		};
	},
	methods: {
		transitionApparentZoom(timestamp) {
			if (this.zoomTransition.lastTime) {
				this.zoomTransition.elapsed += timestamp - this.zoomTransition.lastTime;
			}

			this.zoomTransition.lastTime = timestamp;

			this.apparentZoom = easeInOutQuad(
				this.zoomTransition.elapsed,
				this.zoomTransition.startZoom,
				this.zoomTransition.endZoom,
				this.zoomTransition.duration
			);

			const mainContentEl = this.$refs.mainContent.$el;
			const halfWidth = mainContentEl.clientWidth / 2;
			const halfHeight = mainContentEl.clientHeight / 2;

			/*
			This has to be deferred so that the scroll change happens basically
			concurrently with the re-render based on the changed zoom value.
			Otherwise the animation has a strange stutterstep to it.
			*/

			this.$nextTick(() => {
				mainContentEl.scroll(
					this.zoomTransition.scrollCenterRatio.left *
						mainContentEl.scrollWidth -
						halfWidth,
					this.zoomTransition.scrollCenterRatio.top *
						mainContentEl.scrollHeight -
						halfHeight
				);
			});

			if (this.zoomTransition.elapsed < this.zoomTransition.duration) {
				window.requestAnimationFrame(t => this.transitionApparentZoom(t));
			} else {
				this.apparentZoom = this.story.zoom;
			}
		}
	},
	watch: {
		'story.zoom': {
			handler(value) {
				/* If we are first mounting, immediately change visible zoom. */

				if (this.apparentZoom == null) {
					this.apparentZoom = value;
					return;
				}

				/*
				Otherwise, we animate the zoom transition.
				*/

				const mainContentEl = this.$refs.mainContent.$el;

				this.zoomTransition.elapsed = 0;
				this.zoomTransition.lastTime = null;
				this.zoomTransition.duration = Math.round(
					Math.abs(value - this.apparentZoom) * 1500
				);
				this.zoomTransition.startZoom = this.apparentZoom;
				this.zoomTransition.endZoom = value;

				/*
				Record the current viewport center as a percentage of the total
				viewport dimensions, so we can maintain this as the zoom is
				animated.
				*/

				const halfWidth = mainContentEl.clientWidth / 2;
				const halfHeight = mainContentEl.clientHeight / 2;

				this.zoomTransition.scrollCenterRatio.left =
					(mainContentEl.scrollLeft + halfWidth) / mainContentEl.scrollWidth;
				this.zoomTransition.scrollCenterRatio.top =
					(mainContentEl.scrollTop + halfHeight) / mainContentEl.scrollHeight;

				/*
				Begin animating.
				*/

				window.requestAnimationFrame(t => this.transitionApparentZoom(t));
			},
			immediate: true
		}
	}
};
