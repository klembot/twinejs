'use strict';
var Marionette = require('backbone.marionette');
var collapse = require('../../../ui/collapse');
var resultTemplate = require('./result.ejs');

module.exports = Marionette.ItemView.extend(
{
	template: resultTemplate,

	templateHelpers: function templateHelpers()
	{
		return {
			numMatches:
			this.model.numMatches(this.parent.searchTerm, this.parent.searchNames),

			preview:
			this.model.get('text').replace(this.parent.searchTerm, '<span class="highlight">$1</span>')
		};
	},

	initialize: function (options)
	{
		this.parent = options.parent;
		collapse.attach(this.$el);
	},

	/**
	 Performs a replace in a particular passage result, then
	 hides it from the search results.

	 @method replaceInPassage
	 @param {Event} e event object
	**/

	replaceInPassage: function()
	{
		this.model.replace(this.parent.searchTerm, this.parent.$('#replaceWith').val(),
		                   this.parent.$('#searchNames').prop('checked'));

		this.$el.slideUp('fast', function()
		{
			this.$el.remove();
		});
	},

	events:
	{
		'click .replacePassage': 'replaceInPassage'
	}
});
