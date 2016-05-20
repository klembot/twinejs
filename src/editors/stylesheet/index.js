// A component showing a modal dialog where a story's stylesheet can be edited.

const Vue = require('vue');
const backboneModel = require('../../vue/mixins/backbone-model');
require('codemirror/mode/css/css');
require('codemirror/addon/display/placeholder');
require('codemirror/addon/hint/show-hint');

module.exports = Vue.extend({
	template: require('./index.html'),

	data: () => ({
		stylesheet: ''
	}),

	computed: {
		cmOptions: () => ({
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
		})
	},

	methods: {
		resetCm() {
			this.$refs.codemirror.reset();
		},

		save(text) {
			this.stylesheet = text;
		}
	},
	
	components: {
		'modal-dialog': require('../../ui/modal-dialog'),
		'code-mirror': require('../../vue/codemirror')
	},

	mixins: [backboneModel]
});
