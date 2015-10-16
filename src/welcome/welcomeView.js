/**
 Manages showing the user a quick set of intro information, and then
 records that it's been shown.

 @class WelcomeView
 @extends Backbone.Marionette.ItemView
**/

'use strict';
var $ = require('jquery');
var Marionette = require('backbone.marionette');
var welcomeTemplate = require('./ejs/welcomeView.ejs');
var AppPref = require('../data/models/appPref');
var AppPrefCollection = require('../data/collections/appPrefCollection');

module.exports = Marionette.ItemView.extend(
{
	template: welcomeTemplate,

	initialize: function()
	{
		this.welcomePref = AppPref.withName('welcomeSeen');
	},

	finish: function()
	{
		if (! this.welcomePref)
		{
			this.welcomePref = new AppPref({ name: 'welcomeSeen' });
			new AppPrefCollection().add(this.welcomePref);
		};

		this.welcomePref.save({ value: true });
		window.location.hash = '#stories';
	},

	onRender: function()
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
