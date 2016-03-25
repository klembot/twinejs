/**
 This passes information about the previous view to the current one,
 to help with animating transitions between them.

 @class TransRegion
 @extends Backbone.Region
**/

'use strict';
const Marionette = require('backbone.marionette');
const StoryEditView = require('../story-edit/story-edit-view');
const StoryListView = require('../story-list/story-list-view');

module.exports = Marionette.Region.extend({
	initialize() {
		this.on('before:swapOut', function(view) {
			this.prevView = view;
			
			if (view instanceof StoryEditView) {
				this.prevId = view.model.get('id');
			}
		}.bind(this));

		this.on('swap', function(view) {
			// tell a StoryListView where we were coming from
			if (view.storyListViewShim &&
					this.prevView instanceof StoryEditView) {
				view.appearFast = true;
				view.previouslyEditing = this.prevId;
			}
		}.bind(this));
	}
});
