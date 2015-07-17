/**
 Shows statistics about the story being edited.

 @class StatsModal
 @extends Backbone.View
**/

'use strict';
var Backbone = require('backbone');

var StatsModal = Backbone.View.extend(
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

		// L10n: Character in the sense of individual letters in a word.
		// This does not actually show the count here, as it is used in a table.
		this.$('.charDesc').text(window.app.sayPlural('Character', 'Characters', charCount));

		// L10n: Word in the sense of individual words in a sentence.
		// This does not actually show the count here, as it is used in a table.
		this.$('.wordDesc').text(window.app.sayPlural('Word', 'Words', wordCount));

		// L10n: This does not actually show the count here, as it is used in a table.
		this.$('.passageDesc').text(window.app.sayPlural('Passage', 'Passages', passageCount));

		// L10n: Links in the sense of hypertext links.
		// This does not actually show the count here, as it is used in a table.
		this.$('.linkDesc').text(window.app.sayPlural('Link', 'Links', passageCount));

		// L10n: Links in the sense of hypertext links.
		// This does not actually show the count here, as it is used in a table.
		this.$('.brokenLinkDesc').text(window.app.sayPlural('Broken Link', 'Broken Links', passageCount));

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

module.exports = StatsModal;
