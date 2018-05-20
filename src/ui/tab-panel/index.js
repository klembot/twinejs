// A container for tabs.

const Vue = require('vue');

module.exports = Vue.extend({
	template: require('./index.html'),

	props: {
		active: {
			type: Number,
			default: 0
		}
	},

	data: () => ({}),

	computed: {
		singleWidthPercent() {
			return 1 / this.$children.length * 100;
		}
	}
});
