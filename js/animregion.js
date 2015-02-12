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
		this.oldElContainer = $('<div class="oldView"></div>');
		$('body').append(this.oldElContainer);
	},

	handleSwapOut: function (view)
	{
		this.oldView = view;
		this.oldViewEl = $(view.$el.parent().html());

		// mimic current scroll position by positioning everything inside

		this.oldViewEl.wrapInner('<div style="position:relative;top:-' +
		                         $(window).scrollTop() + 'px;' + 'left:-' +
								 $(window).scrollLeft() + 'px"></div>');
	},

	handleSwap: function (view)
	{
		if (this.oldView instanceof StoryListView && view instanceof StoryEditView)
		{
			// keep old HTML underneath the incoming view

			this.oldElContainer.append(this.oldViewEl);
			this.oldViewEl.addClass('transitioning bottom');

			// animate the new view

			view.$el.addClass('transitioning fullSlideUp slow')
			.one('animationend', _.bind(function()
			{
				this.oldElContainer.empty();
				view.$el.removeClass('transitioning');

				// we have to tell the view that its overall size just changed
				view.resize();
			}, this));
		};

		if (view instanceof StoryListView && this.oldView instanceof StoryEditView)
		{
			// tell the incoming view not to animate

			view.appearFast = true;

			// transition old HTML out

			this.oldElContainer.append(this.oldViewEl);

			this.oldViewEl.removeClass('fullSlideUp')
			.addClass('transitioning top fullSlideDownOut slow')
			.one('animationend', _.bind(function()
			{
				this.oldElContainer.empty();
			}, this));
		};
	}
});
