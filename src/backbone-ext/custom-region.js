/*
# custom-region

This exports a class extending [Marionette.Region](1) which passes information
about the previous view to the current one, to help with animating transitions
between them. This also attaches tooltips to every new view via the ui/tooltip
module.

[1]: http://marionettejs.com/docs/v2.4.4/marionette.region.html
*/

'use strict';
var Marionette = require('backbone.marionette');
var Tooltip = require('../ui/tooltip');
var StoryEditView = require('../story-edit/view');
var StoryListView = require('../story-list/view');

module.exports = Marionette.Region.extend(
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
			/*
			If we're going back to the story list from editing a story, tell
			the view which story we're coming back from, and that it
			shouldn't animate the stories appearing in the list.
			*/

			if (view instanceof StoryListView && this.prevView instanceof StoryEditView)
			{
				view.appearFast = true;
				view.previouslyEditing = this.prevId;
			};
		}.bind(this));

		this.on('show', function (view)
		{
			Tooltip.attach(view.el);
		});
	}
});
