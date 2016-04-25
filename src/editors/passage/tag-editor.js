// An editor for adding and removing tags from a passage.

const Vue = require('vue');

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

			if (this.tags.indexOf(newName) === -1) {
				this.tags.push(newName);
				this.$emit('change', this.tags);
			}

			this.hideNew();
		},

		remove(name) {
			const index = this.tags.indexOf(name);

			if (index !== -1) {
				this.tags.splice(index, 1);
				this.$emit('change', this.tags);
			}
		}
	}
});
