/**
 This passes information about the previous view to the current one,
 to help with animating transitions between them.

 @class TransRegion
 @extends Backbone.Region
**/

'use strict';
var StoryEditView = require('views/storyEditView/storyEditView');
var StoryListView = require('views/storyListView/storyListView');

var TransRegion = Backbone.Marionette.Region.extend(
{
	initialize: function()
	{
		this.on('before:swapOut', function (view)
		{
			this.prevView = view;
			
			if (view instanceof StoryEditView)
				this.prevId = view.model.get('id');
		}.bind(this));

		this.on('swap', function (view)
		{
			// tell a StoryListView where we were coming from

			if (view instanceof StoryListView && this.prevView instanceof StoryEditView)
			{
				view.appearFast = true;
				view.previouslyEditing = this.prevId;
			};
		}.bind(this));
	}
});

module.exports = TransRegion;
