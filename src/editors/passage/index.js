/*
A modal dialog for editing a single passage.
*/

const { thenable } = require('../../vue/mixins/thenable');
const Vue = require('vue');

module.exports = Vue.extend({
	template: `<modal-dialog id="passageEditModal" class="editor" :can-close="()=>true" :can-widen="true" :origin="origin" @destroyed="dialogDestroyed" v-ref:modal>
		<span slot="title">
			<input type="text" id="title" placeholder="{{ 'Passage Name' | say }}" v-model="title">
		</span>
		<editor-passage :passage-data="passageData" :name="title" @change="updateTitle"></edior-passage>
	</modal-dialog>`,

	data: () => ({
		passageId: '',
		storyId: '',
		oldWindowTitle: '',
		userPassageName: '',
		saveError: '',
		origin: null,
		title: '',
	}),

	computed: {
		passageData() { return this._data; }
	},

	methods: {
		updateTitle(title) {
			this.title = title;
		},
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

	mixins: [thenable]
});
