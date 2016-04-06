// A component showing a modal dialog where a story's stylesheet can be edited.

const Vue = require('vue');
require('codemirror/mode/css/css');
require('codemirror/addon/display/placeholder');
require('codemirror/addon/hint/show-hint');

module.exports = Vue.extend({
	template: require('./index.html'),

	data: () => ({
		model: Object,

		cmOptions: {
			lineWrapping: true,
			lineNumbers: false,
			tabSize: 4,
			indentWithTabs: true,
			mode: 'css',
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
			this.model.save({ stylesheet: text });
		}
	},
	
	components: {
		'modal-dialog': require('../../ui/modal-dialog'),
		'codemirror': require('../../vue/codemirror')
	}
});
