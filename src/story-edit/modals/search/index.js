'use strict';
var Marionette = require('backbone.marionette');
var locale = require('../../../locale');
var modal = require('../../../ui/modal');
var notify = require('../../../ui/notify');
var Passages = require('../../../data/passages');
var Result = require('./result');
var modalTemplate = require('./modal.ejs');
var noMatchesTemplate = require('./no-matches.ejs');

module.exports = Marionette.CollectionView.extend(
{
	childView: Result,
	childViewOptions: function()
	{
		return { parent: this };
	},
	emptyView: Marionette.ItemView.extend(
	{
		template: noMatchesTemplate	
	}),

	/**
	 Opens a modal dialog for search/replace.
	**/

	open: function (collection)
	{
		this.sourceCollection = collection;
		this.collection = new Passages();
		this.collection.on('reset', this.render);

		this.setElement(modal.open(
		{
			content: Marionette.Renderer.render(modalTemplate)
		}));
	},

	/**
	 Performs a search in story passages, updating the collection.

	 @method updateResults
	**/

	updateResults: function()
	{
		this.searchTerm = this.searchRegexp();
		this.searchNames = this.$('#searchNames').prop('checked');

		if (this.searchTerm.source === '')
		{
			// bug out early if there was no text entered

			this.collection.reset([]);
			this.$('.resultSummary').addClass('hide');
			return;
		};

		var matches = [];

		this.sourceCollection.each(function (model)
		{
			var numMatches = model.numMatches(this.searchTerm, this.searchNames);

			if (numMatches !== 0)
				matches.push(model);
		}.bind(this));

		this.collection.reset(matches);
		this.$('.resultSummary').removeClass('hide');
		this.$('.resultSummary .matches').text(locale.sayPlural('%d match', '%d matches', matches.length));
	},

	/**
	 Performs a replace in all passages, closes the modal,
	 then shows a notification as to how many replacements were made.

	 @method replaceAll
	**/

	replaceAll: function()
	{
		var passagesMatched = 0;
		var totalMatches = 0;
		var searchTerm = this.searchRegexp();
		var replaceWith = this.$('#replaceWith').val();
		var inNames = this.$('#searchNames').prop('checked');

		this.collection.each(function (model)
		{
			var numMatches = model.numMatches(searchTerm);

			if (numMatches !== 0)
			{
				passagesMatched++;
				totalMatches += numMatches;
				model.replace(searchTerm, replaceWith, inNames);
			};
		}.bind(this));

		this.$el.one('modalClose.twineui', function()
		{
			// L10n: replacement in the sense of text search and replace. %d is the number.
			var replacementDesc = locale.sayPlural('%d replacement was made in',
			                                       '%d replacements were made in', totalMatches);

			// L10n: %d is a number of passages.
			var passageDesc = locale.sayPlural('%d passage', '%d passages', passagesMatched);

			// L10n: This is the formatting used to combine two pluralizations.
			// In English, %1$s equals "2 replacements were made in" and %2$s equals "5 passages."
			// This is a way to reshape the sentence as needed.
			notify(locale.say('%1$s %2$s.', replacementDesc, passageDesc), 'success');
		});

		modal.close();
	},

	/**
	 Creates a RegExp object to match the entered text and checkboxes selected.

	 @method searchRegexp
	 @return {RegExp} the resulting regular expression
	**/

	searchRegexp: function()
	{
		var flags = 'g';

		if (! this.$('#searchCaseSensitive').prop('checked'))
			flags += 'i';

		var source = this.$('#searchFor').val();

		if (this.$('#searchRegexp').prop('checked'))
			source = source.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

		return new RegExp('(' + source + ')', flags);
	},

	attachBuffer: function (view, buffer)
	{
		view.$('.results').append(buffer);
	},

	events:
	{
		'keyup #searchFor': 'updateResults',
		'change #searchNames': 'updateResults',
		'change #searchCaseSensitive': 'updateResults',
		'change #searchRegexp': 'updateResults',
		'click .replaceAll': 'replaceAll'
	}
});
