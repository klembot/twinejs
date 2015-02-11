/**
 This is a custom Region that manages animating the transition between
 StoryListViews and StoryEditViews.
 
 @class AnimRegion
 @extends Backbone.Marionette.Region
**/

var AnimRegion = Backbone.Marionette.Region.extend(
{
	initialize: function()
	{
		this.on('before:swapOut', _.bind(this.handleSwapOut, this));
		this.on('swap', _.bind(this.handleSwap, this));
	},

	handleSwapOut: function (view)
	{
		this.oldView = view;
		this.oldViewEl = view.$el;
	},

	handleSwap: function (view)
	{
		if (this.oldView instanceof StoryListView && view instanceof StoryEditView)
		{
			// keep old HTML underneath the incoming view

			this.oldViewEl.addClass('transitioning bottom');
			view.$('#storyEditView').addClass('transitioning fullSlideUp slow')
			.one('animationend', _.bind(function()
			{
				this.oldViewEl.remove();
			}, this));
			$('body').append(this.oldViewEl);
		};

		if (view instanceof StoryListView && this.oldView instanceof StoryEditView)
			console.log('going from edit to list');
	}
});
