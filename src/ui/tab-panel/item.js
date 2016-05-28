const Vue = require('vue');

module.exports = Vue.extend({
	template:
		`<div :class="{hide:hidden}">
		<slot></slot>
		</div>`,

	props: {
		name: String,
	},

	data: () => ({}),

	computed: {
		index() {
			return this.$parent.$children.indexOf(this);
		},

		hidden() {
			return (this.$parent.active !== this.index);
		},
	},
});
