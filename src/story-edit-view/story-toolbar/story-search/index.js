// Shows a quick search field, which changes passage highlights, and a button
// to show the search modal dialog.

const Vue = require('vue');
const SearchDialog = require('../../../dialogs/story-search');

module.exports = Vue.extend({
	template: require('./index.html'),

	props: ['collection'],

	data: () => ({
		search: ''
	}),

	watch: {
		'search'() {
			// Convert the entered text to regexp, escaping text, and tell our
			// parent to change its highlight criteria.
			// This is cribbed from
			// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions.

			this.$dispatch(
				'highlight-regexp-change',
				new RegExp(
					this.search.replace(/([.*+?^${}()|\[\]\/\\])/g, '\\$1'), 'i'
				)
			);
		}
	},

	methods: {
		/**
		 Shows the search modal.

		 @method showModal
		**/

		showModal() {
			new SearchDialog({ data: {
				passages: this.collection,
				search: this.search
			} }).$mountTo(document.body);
		}
	}
});
