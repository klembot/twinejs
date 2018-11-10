// A lightweight Vue component that wraps a CodeMirror instance.

const Vue = require("vue");
const eventHub = require("../common/eventHub");
const CodeMirror = require("codemirror");

require("./codemirror-theme.less");

module.exports = Vue.extend({
	template: "<div></div>",

	props: ["options", "text"],

	mounted() {
		this.$cm = CodeMirror(this.$el, this.options);
		this.$cm.setValue((this.text || "") + "");

		this.$cm.on("change", () => {
			this.$emit("cm-change", this.$cm.getValue());
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
