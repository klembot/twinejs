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
		tagName: '',
		appendText: '',
	}),

	computed: {
		selectedPassages() { return this.story.passages.filter(passage => passage.selected); },
		allTags() { return this.story.tagColors; },
	},

	methods: {
		apply() {
			console.log(this.tagName, this.appendText);
			this.selectedPassages.forEach(passage => {
				if (this.appendText) passage.text += '\n' + this.appendText;
				if (this.tagName) this.tagName.split(',')
					.filter(Boolean).forEach(tag => {
						if (!passage.tags.includes(tag))
							passage.tags.push(tag);
					});
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
