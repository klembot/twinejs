// A lightweight Vue component that wraps a CodeMirror instance.

import Vue from 'vue';

import eventHub from '../common/eventHub';
import CodeMirror from 'codemirror';
import './codemirror-theme.less';

export default Vue.extend({
	template: '<div></div>',

	props: ['options', 'text'],

	mounted() {
		this.$cm = CodeMirror(this.$el, this.options);
		this.$cm.setValue((this.text || '') + '');

		/*
		Remove the empty state from existing in undo history, e.g. so if the
		user immediately hits Undo, the editor becomes empty.
		*/

		this.$cm.clearHistory();

		this.$cm.on('change', () => {
			this.$emit('cm-change', this.$cm.getValue());
		});
		this.$nextTick(function() {
			this.$cm.focus();
		});
	},

	created: function() {
		// Since CodeMirror initialises incorrectly when special CSS such as
		// scaleY is present on its containing element, it should be
		// refreshed once transition is finished - hence, this event.
		eventHub.$on('transition-entered', () => {
			this.$cm.refresh();
		});
	}
});
