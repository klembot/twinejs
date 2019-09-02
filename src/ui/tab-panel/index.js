/* A container for tabs. */

import Vue from 'vue';
import template from './index.html';

export default Vue.extend({
	template,
	props: {
		active: {type: Number, default: 0}
	},
	data: () => ({}),
	computed: {
		singleWidthPercent() {
			return (1 / this.$children.length) * 100;
		}
	},
	methods: {
		updateActiveTab(newIndex) {
			this.active = newIndex;
			/* recompute all children indexes */
			this.$forceUpdate();
		}
	}
});
