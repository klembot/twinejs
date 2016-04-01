const Vue = require('vue');

module.exports = Vue.extend({
	template:
		`<div>
		<p class="tabs-panel">
		<button v-for="t in tabs" :class="{active: ($index === active)}"
			:style="{width:(1/tabs.length * 100) + '%'}"
			@click.prevent="this.active = $index">{{ t.name |say}}</button>
		</p>
		<div class="tabContent">
		<slot></slot>
		</div>
		</div>`,
	props: {
		active: {
			type: Number,
			default: 0,
		},
	},
	data: () => ({}),
	computed: {
		tabs() { return this.$children; }
	},
});
