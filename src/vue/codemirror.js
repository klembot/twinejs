// A lightweight Vue component that wraps a CodeMirror instance.

const Vue = require("vue");
const eventHub = require("../common/eventHub");
const CodeMirror = require("codemirror");

require("./codemirror-theme.less");

module.exports = Vue.extend({
	template: "<div></div>",

	props: ["options", "text"],

	watch: {
		text() {
			// Only change CodeMirror if it's actually a meaningful change,
			// e.g. not the result of CodeMirror itself changing.

			if (this.text !== this.$cm.getValue()) {
				this.$cm.setValue(this.text);
			}
		}
	},

	mounted() {
		this.$cm = CodeMirror(this.$el, this.options);
		this.$cm.setValue((this.text || "") + "");

		this.$cm.on("change", () => {
			this.text = this.$cm.getValue();
			eventHub.$emit("cm-change", this.text);
		});
		this.$nextTick(function() {
			this.$cm.focus();
		});
	},

	created: function() {
		// Since CodeMirror initialises incorrectly when special CSS such as
		// scaleY is present on its containing element, it should be
		// refreshed once transition is finished - hence, this event.
		eventHub.$on("transition-entered", () => {
			this.$cm.refresh();
		});
	}
});
