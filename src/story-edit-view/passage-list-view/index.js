/*
A modal dialog for editing a multiple passages.
*/

const Vue = require('vue');
const locale = require('../../locale');
const { thenable } = require('../../vue/mixins/thenable');

require('codemirror/addon/display/placeholder');
require('codemirror/addon/hint/show-hint');
require('../../codemirror/prefix-trigger');
const {
	updatePassage
} =
	require('../../data/actions/passage');

require('./index.less');

module.exports = Vue.extend({
	template: require('./index.html'),

	props: {
		story: {
			type: Object,
			required: true
		},
	},

	data: () => ({
	}),

	computed: {
		passages() { return this.selectedPassages.length ? this.selectedPassages : thos.story.passages; },
		selectedPassages() { return this.story.passages.filter(passage => passage.selected); },
	},

	methods: {
		apply() {
			this.passages.forEach(passage => {
				this.updatePassage(
					this.story.id,
					passage.id,
					{ ...passage }
				);
			});
		},
		dialogDestroyed() {
			this.apply();
			this.$emit('close'); // TODO: modal not correctly used
			this.$destroy();
		},
	},

	ready() {
		console.log(this.story);
	},

	destroyed() {
	},

	components: {
		'modal-dialog': require('../../ui/modal-dialog'),
		'tag-editor': require('../../editors/passage/tag-editor'),
	},

	vuex: {
		actions: {
			updatePassage,
		},

		getters: {
		}
	},

	mixins: [thenable]
});
