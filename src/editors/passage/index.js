/*
A modal dialog for editing a single passage.
*/

const Vue = require('vue');

module.exports = Vue.extend({
	template: `<modal-dialog id="passageEditModal" class="editor" :can-close="canClose" :can-widen="true" :origin="origin" @destroyed="dialogDestroyed" v-ref:modal>
		<editor-passage :passage-data="passageData"></edior-passage>
	</modal-dialog>`,

	data: () => ({
		passageId: '',
		storyId: '',
		oldWindowTitle: '',
		userPassageName: '',
		saveError: '',
		origin: null
	}),

	computed: {
		passageData() { return this._data; }
	},

	methods: {
		dialogDestroyed() {
			this.$destroy();
		},
	},

	components: {
		'code-mirror': require('../../vue/codemirror'),
		'modal-dialog': require('../../ui/modal-dialog'),
		'tag-editor': require('./tag-editor'),
		'editor-passage': require('./standalone')
	},
});
