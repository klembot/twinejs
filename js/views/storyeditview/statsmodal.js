/**
 Shows statistics about the story being edited.

 @class StatsModal
 @extends Backbone.View
**/

'use strict';

StoryEditView.StatsModal = Backbone.View.extend(
{
	initialize: function (options)
	{
		this.parent = options.parent;
	},

	/**
	 Opens the modal dialog.

	 @method open
	**/

	open: function()
	{
		// calculate counts

		var charCount = 0;
		var wordCount = 0;
		var passageCount = 0;
		var linkCount = 0;
		var brokenLinkCount = 0;
		var passageLinks = {};
		var passageNames = [];

		_.each(this.parent.collection.models, function (passage)
		{
			passageCount++;
			var text = passage.get('text');
			charCount += text.length;
			wordCount += text.split(/\s+/).length;
			var links = passage.links();
			linkCount += links.length;
			passageNames.push(passage.get('name'));

			_.each(links, function (link)
			{
				passageLinks[link] = (passageLinks[link] || 0) + 1;
			});
		});

		// we calculate broken links now that we have
		// a complete list of names

		_.each(passageLinks, function (count, name)
		{
			if (passageNames.indexOf(name) == -1)
				brokenLinkCount += count;
		});

		this.$('.charCount').text(charCount.toLocaleString());
		this.$('.wordCount').text(wordCount.toLocaleString());
		this.$('.passageCount').text(passageCount.toLocaleString());
		this.$('.linkCount').text(linkCount.toLocaleString());
		this.$('.brokenLinkCount').text(brokenLinkCount.toLocaleString());

		this.$el.data('modal').trigger('show');
	},

	/**
	 Closes the modal dialog.

	 @method close
	**/

	close: function()
	{
		this.$el.data('modal').trigger('hide');
	},

});
