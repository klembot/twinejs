// A lightweight Vue component that wraps a CodeMirror instance.

const Vue = require('vue');
const CodeMirror = require('codemirror');

module.exports = Vue.extend({
	template: '<div></div>',

	props: ['options', 'text'],

	watch: {
		text() {
			// Only change CodeMirror if it's actually a meaningful change,
			// e.g. not the result of CodeMirror itself changing.

			if (this.text !== this.cm.getValue()) {
				this.cm.setValue(this.text);
			}
		},
	},

	compiled() {
		this.cm = CodeMirror(this.$el, this.options);

		this.cm.setValue((this.text || '') + '');

		this.cm.on('change', () => {
			this.text = this.cm.getValue();
			this.$dispatch('cmChange', this.text);
		});
	},

	attached() {
		this.cm.refresh();
		this.cm.focus();
	},
});



