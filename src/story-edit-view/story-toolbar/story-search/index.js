// Shows a quick search field, which changes passage highlights, and a button
// to show the search modal dialog.

const Vue = require('vue');
const SearchDialog = require('../../../dialogs/story-search');

module.exports = Vue.extend({
	template: require('./index.html'),

	props: ['parent', 'passageViews'],

	data: () => ({
		search: ''
	}),

	watch: {
		'search'() {
			this.searchFor(this.search);
		}
	},

	methods: {
		/**
		 Adjusts passage view highlighting based on a search criteria.

		 @method searchFor
		 @param {String} search string to search for
		 @param {String} flags Regexp flags to apply, defaults to 'i'
		**/

		searchFor(search, flags) {
			if (search === '') {
				return;
			}

			// convert entered text to regexp, escaping text
			// cribbed from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions

			search = new RegExp(search.replace(/([.*+?^${}()|\[\]\/\\])/g, '\\$1'), flags || 'i');

			this.passageViews.each(view => {
				if (view.model.matches(search)) {
					view.highlight();
				}
				else {
					view.unhighlight();
				}
			});
		},

		/**
		 Shows the search modal.

		 @method showModal
		**/

		showModal() {
			new SearchDialog({ data: {
				passages: this.parent.collection.models,
				search: this.search
			} }).$mountTo(document.body);
		}
	}
});
