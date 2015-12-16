/**
 Manages showing the user a quick set of intro information, and then
 records that it's been shown.

 @class WelcomeView
 @extends Backbone.Marionette.ItemView
**/

'use strict';
var $ = require('jquery');
var Marionette = require('backbone.marionette');
var viewTemplate = require('./view.ejs');
var Pref = require('../data/pref');
var Prefs = require('../data/prefs');

module.exports = Marionette.View.extend(
{
	template: viewTemplate,

	initialize: function()
	{
		this.welcomePref = Pref.withName('welcomeSeen');
	},

	finish: function()
	{
		if (! this.welcomePref)
		{
			this.welcomePref = new Pref({ name: 'welcomeSeen' });
			new Prefs().add(this.welcomePref);
		};

		this.welcomePref.save({ value: true });
		window.location.hash = '#stories';
	},

	onShow: function()
	{
		this.$('div:first-child').css('display', 'block').addClass('appear');

		this.$el.on('click', 'button, a.done', function (e)
		{
			var $t = $(e.target);
			var next = $t.closest('div').next('div');

			// fade out existing buttons

			$t.closest('p').addClass('fadeOut')
			.on('animationend', function ()
			{
				$(this).remove();
			});

			// either show the next div, or move on to the story list
			// have to offset the position because we're animating it
			// downward, I think

			if ($t.hasClass('done'))
				this.finish();
			else
			{
				next.css('display', 'block').addClass('slideDown');
				$('body').animate({ scrollTop: next.position().top + 100 });
			};
		}.bind(this));
	}
});
