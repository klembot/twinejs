/*
A modal dialog for editing a single passage.
*/

const { thenable } = require('../../vue/mixins/thenable');
const Vue = require('vue');

module.exports = Vue.extend({
	template: `<modal-dialog id="passageEditModal" class="editor" :can-close="canClose" :can-widen="true" :origin="origin" @destroyed="dialogDestroyed" v-ref:modal>
		<span slot="title">
			<input v-if="passageEl" type="text" id="title" placeholder="{{ 'Passage Name' | say }}" v-model="passageEl.userPassageName">
		</span>
		<editor-passage :passage-data="passageData" v-ref:passage></edior-passage>
	</modal-dialog>`,

	data: () => ({
		passageId: '',
		storyId: '',
		oldWindowTitle: '',
		userPassageName: '',
		saveError: '',
		origin: null,
		passageEl: null,
	}),

	computed: {
		passageData() { return this._data; },
	},

	methods: {
		dialogDestroyed() {
			this.$destroy();
		},
		canClose() {
			return this.$refs.passage.canClose();
		}
	},

	ready() {
		this.passageEl = this.$refs.passage;
	},

	components: {
		'code-mirror': require('../../vue/codemirror'),
		'modal-dialog': require('../../ui/modal-dialog'),
		'tag-editor': require('./tag-editor'),
		'editor-passage': require('./standalone')
	},

	mixins: [thenable]
});
