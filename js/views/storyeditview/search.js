/**
 Manages the search box and associated modal.

 @class StoryEditView.Search
 @extends Backbone.View
**/

StoryEditView.Search = Backbone.View.extend(
{
	initialize: function (options)
	{
		this.parent = options.parent;
		this.searchField = this.$('.searchField');
	},

	/**
	 Adjusts passage view highlighting based on a search criteria.

	 @method searchFor
	 @param {String} search string to search for
	 @param {String} flags Regexp flags to apply, defaults to 'i'
	**/

	searchFor: function (search, flags)
	{
		var search = new RegExp(search, flags || 'i');

		this.parent.children.each(function (view)
		{
			var model = view.model;

			if (search.test(model.get('name')) || search.test(model.get('text')))
				view.highlight();
			else
				view.unhighlight();
		});
	},

	/**
	 Removes all highlighting from passage views.

	 @method clear
	**/

	clear: function()
	{
		this.searchField.val('');
		this.$('.clearSearch').addClass('hide');

		this.parent.children.each(function (view)
		{
			view.unhighlight();
		});
	},

	events:
	{
		'click .clearSearch': 'clear',

		'keyup .searchField': _.debounce(function (e)
		{
			// Escape key clears the field

			if (e.keyCode == 27)
				this.searchField.val('');

			var search = this.searchField.val();

			if (search != '')
			{
				this.$('.clearSearch').removeClass('hide');
				this.searchFor(this.searchField.val());
			}
			else
			{
				this.clear();
			};

		}, 100)
	}
});
