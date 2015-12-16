/**
 Manages the search box and associated modal.

 @class StoryEditView.Search
 @extends Backbone.View
**/

'use strict';
var _ = require('underscore');
var Backbone = require('backbone');

module.exports = Backbone.View.extend(
{
	initialize: function (options)
	{
		this.parent = options.parent;
		this.collectionOwner = options.collectionOwner;
		this.collectionOwner.collection.on('change:name', refreshSearch.bind(this));
		this.collectionOwner.collection.on('change:text', refreshSearch.bind(this));
		this.setElement(options.el);

		function refreshSearch()
		{
			this.searchFor(this.$el.val());
		};
	},

	/**
	 Adjusts passage view highlighting based on a search criteria.

	 @method searchFor
	 @param {String} search string to search for
	 @param {String} flags Regexp flags to apply, defaults to 'i'
	**/

	searchFor: function (search, flags)
	{
		// special case: empty string clears all searches

		if (search === '')
		{
			this.collectionOwner.children.each(function unhighlightAll (view)
			{
				view.unhighlight();
			});

			return;
		};

		// convert entered text to regexp, escaping text
		// cribbed from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions

		search = new RegExp(search.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1"), flags || 'i');

		this.collectionOwner.children.each(function (view)
		{
			if (view.model.matches(search))
				view.highlight();
			else
				view.unhighlight();
		});
	},

	events:
	{
		'keyup': _.debounce(function (e)
		{
			// Escape key clears the field

			if (e.keyCode == 27)
				this.$el.val('');

			this.searchFor(this.$el.val());
		}, 100)
	}
});
