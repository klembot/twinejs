/**
 This passes information about the previous view to the current one,
 to help with animating transitions between them.

 @class TransRegion
 @extends Backbone.Region
**/

'use strict';

TransRegion = Backbone.Marionette.Region.extend(
{
	initialize: function()
	{
		this.on('before:swapOut', _.bind(function (view)
		{
			this.prevView = view;
			
			if (view instanceof StoryEditView)
				this.prevId = view.model.get('id');
		}, this));

		this.on('swap', _.bind(function (view)
		{
			// tell a StoryListView where we were coming from

			if (view instanceof StoryListView && this.prevView instanceof StoryEditView)
			{
				view.appearFast = true;
				view.previouslyEditing = this.prevId;
			};

		}, this));
	}
});
