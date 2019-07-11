// A lightweight Vue component that wraps a CodeMirror instance.

const Vue = require('vue');
const CodeMirror = require('codemirror');

require('./codemirror-theme.less');

module.exports = Vue.extend({
	template: '<div></div>',

	props: ['options', 'text'],

	watch: {
		text() {
			// Only change CodeMirror if it's actually a meaningful change,
			// e.g. not the result of CodeMirror itself changing.

			if (this.text !== this.$cm.getValue()) {
				this.$cm.setValue(this.text);
			}
		}
	},

	compiled() {
		this.$cm = CodeMirror(this.$el, this.options);
		this.$cm.setValue((this.text || '') + '');

		/*
		Remove the empty state from existing in undo history, e.g. so if the
		user immediately hits Undo, the editor becomes empty.
		*/

		this.$cm.clearHistory();

		this.$cm.on('change', () => {
			this.text = this.$cm.getValue();
			this.$dispatch('cm-change', this.text);
		});
	},

	attached() {
		this.$cm.focus();
	},

	events: {
		// Since CodeMirror initialises incorrectly when special CSS such as
		// scaleY is present on its containing element, it should be
		// refreshed once transition is finished - hence, this event.
		'transition-entered'() {
			this.$cm.refresh();
		}
	}
});
