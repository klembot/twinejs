'use strict';
var Marionette = require('backbone.marionette');
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
	},

	/**
	 Performs a replace in a particular passage result, then
	 hides it from the search results.

	 @method replaceInPassage
	 @param {Event} e event object
	**/

	replaceInPassage: function (e)
	{
		var container = $(e.target).closest('.result');	

		this.model.replace(this.searchRegexp(), this.$('#replaceWith').val(),
		                   this.$('#searchNames').prop('checked'));
		container.slideUp(null, function() { container.remove(); });
	},
});
