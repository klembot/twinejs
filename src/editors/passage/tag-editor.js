// An editor for adding and removing tags from a passage.

const Vue = require('vue');
const _ = require('underscore');

module.exports = Vue.extend({
	data: () => ({
		newVisible: false
	}),

	props: ['tags'],

	template: require('./tag-editor.html'),

	methods: {
		showNew() {
			this.newVisible = true;
			this.$nextTick(() =>
				this.$els.newName.focus()
			);
		},

		hideNew() {
			this.newVisible = false;
		},

		addNew() {
			const newName = this.$els.newName.value.replace(/\s/g, '-');

			// Clear the newName element while it's transitioning out.
			this.$els.newName.value = '';

			// Since this event will cause the entire <tag-editor> to be re-rendered
			// (due to changing the upstream <passage-editor>'s tags data),
			// this component does not need to modify its own tags data at all.
			this.$dispatch('tag-change', _.uniq([].concat(this.tags, newName)));

			this.hideNew();
		},

		remove(name) {
			this.$dispatch('tag-change', _.without(this.tags, name));
		}
	}
});
