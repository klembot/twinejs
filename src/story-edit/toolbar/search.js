/*
# story-edit/toolbar/search

Exports a view which manages the quick search portion of a story editor's
toolbar.
*/

'use strict';
var _ = require('underscore');
var Backbone = require('backbone');

module.exports = Backbone.View.extend({
	initialize: function(options) {
		this.parent = options.parent;

		/*
		The view whose collection of passages we will be searching.

		@property collectionOwner
		*/
		this.collectionOwner = options.collectionOwner;
		this.collectionOwner.collection.on('change:name', refreshSearch.bind(this));
		this.collectionOwner.collection.on('change:text', refreshSearch.bind(this));
		this.setElement(options.el);

		function refreshSearch() {
			this.searchFor(this.$el.val());
		}
	},

	/*
	Adjusts passage view highlighting based on a search criteria.

	@method searchFor
	@param {String} search string to search for
	@param {String} flags Regexp flags to apply, defaults to 'i'
	*/
	searchFor: function(search, flags) {
		// Special case: an empty string clears all searches.

		if (search === '') {
			this.collectionOwner.children.each(function unhighlightAll(view) {
				view.unhighlight();
			});

			return;
		}

		// jscs:disable maximumLineLength

		/*
		Convert the entered text to a regexp. The method we use to escape text
		is cribbed from
		https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
		*/

		// jscs:enable maximumLineLength

		search = new RegExp(
			search.replace(/([.*+?^${}()|\[\]\/\\])/g, '\\$1'),
			flags || 'i'
		);

		this.collectionOwner.children.each(function updateHighlight(view) {
			if (view.model.matches(search)) {
				view.highlight();
			}
			else {
				view.unhighlight();
			}
		});
	},

	events: {
		keyup: _.debounce(function(e) {
			// The Escape key clears the field.

			if (e.keyCode == 27) this.$el.val('');

			this.searchFor(this.$el.val());
		}, 100)
	}
});
