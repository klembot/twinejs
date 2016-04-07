// A component showing a modal dialog where a story's JavaSCript.

const Vue = require('vue');
require('codemirror/mode/javascript/javascript');
require('codemirror/addon/display/placeholder');
require('codemirror/addon/hint/show-hint');

module.exports = Vue.extend({
	template: require('./index.html'),

	data: () => ({
		model: Object,

		cmOptions: {
			lineWrapping: true,
			lineNumbers: false,
			tabSize: 2,
			indentWithTabs: true,
			mode: 'javascript',
			extraKeys: {
				'Ctrl-Space'(cm) {
					cm.showHint();
				}
			}
		}
	}),
	
	methods: {
		opened() {
			this.$refs.codemirror.cm.refresh();
			this.$refs.codemirror.cm.focus();
		},

		cmChanged(text) {
			this.model.save({ javascript: text });
		}
	},
	
	components: {
		'modal-dialog': require('../../ui/modal-dialog'),
		'codemirror': require('../../vue/codemirror')
	}
});
