'use strict';
var Marionette = require('backbone.marionette');
var modal = require('../../../ui/modal');
var TwineApp = require('../../../common/app');
var modalTemplate = require('./modal.ejs');

module.exports = Marionette.View.extend(
{
	initialize: function (options)
	{
		this.parent = options.parent;
	},

	open: function()
	{
		modal.open({
			content: Marionette.Renderer.render(modalTemplate, TwineApp.version())
		});
	},

	close: function()
	{

	}
});
