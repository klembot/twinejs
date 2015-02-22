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

		// adjust visibility of singular/plural nouns

		if (charCount != 1)
		{
			this.$('.charDesc .singular').addClass('hide');
			this.$('.charDesc .plural').removeClass('hide');
		}
		else
		{
			this.$('.charDesc .singular').removeClass('hide');
			this.$('.charDesc .plural').addClass('hide');
		};

		if (wordCount != 1)
		{
			this.$('.wordDesc .singular').addClass('hide');
			this.$('.wordDesc .plural').removeClass('hide');
		}
		else
		{
			this.$('.wordDesc .singular').removeClass('hide');
			this.$('.wordDesc .plural').addClass('hide');
		};

		if (passageCount != 1)
		{
			this.$('.passageDesc .singular').addClass('hide');
			this.$('.passageDesc .plural').removeClass('hide');
		}
		else
		{
			this.$('.passageDesc .singular').removeClass('hide');
			this.$('.passageDesc .plural').addClass('hide');
		};

		if (linkCount != 1)
		{
			this.$('.linkDesc .singular').addClass('hide');
			this.$('.linkDesc .plural').removeClass('hide');
		}
		else
		{
			this.$('.linkDesc .singular').removeClass('hide');
			this.$('.linkDesc .plural').addClass('hide');
		};

		if (brokenLinkCount != 1)
		{
			this.$('.brokenLinkDesc .singular').addClass('hide');
			this.$('.brokenLinkDesc .plural').removeClass('hide');
		}
		else
		{
			this.$('.brokenLinkDesc .singular').removeClass('hide');
			this.$('.brokenLinkDesc .plural').addClass('hide');
		};

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
