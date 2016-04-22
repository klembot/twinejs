// A component showing a modal dialog where a story's JavaSCript.

const Vue = require('vue');
const backboneModel = require('../../vue/mixins/backbone-model');
require('codemirror/mode/javascript/javascript');
require('codemirror/addon/display/placeholder');
require('codemirror/addon/hint/show-hint');

module.exports = Vue.extend({
	template: require('./index.html'),

	data: () => ({
		javascript: ''
	}),

	computed: {
		cmOptions: () => ({
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
		})
	},
	
	methods: {
		resetCm() {
			this.$refs.codemirror.reset();
		},

		save(text) {
			this.javascript = text;
		}
	},
	
	components: {
		'modal-dialog': require('../../ui/modal-dialog'),
		'code-mirror': require('../../vue/codemirror')
	},

	mixins: [backboneModel]
});
