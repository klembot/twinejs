'use strict';
var Marionette = require('backbone.marionette');
var resultTemplate = require('./result.ejs');

module.exports = Marionette.ItemView.extend(
{
	template: resultTemplate,

	templateHelpers:
	{
		numMatches: function()
		{
			return 13;
		},

		preview: function()
		{
			return 'Hello world!';
		}
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

		model.replace(this.searchRegexp(), this.$('#replaceWith').val(),
		              this.$('#searchNames').prop('checked'));
		container.slideUp(null, function() { container.remove(); });
	},
});
