/**
 Manages showing the user a quick set of intro information, and then
 records that it's been shown.

 @class WelcomeView
 @extends Backbone.Marionette.ItemView
**/

'use strict';
var AppPref = require('../models/appPref');

var WelcomeView = Backbone.Marionette.ItemView.extend(
{
	template: '#templates .welcomeView',

	initialize: function()
	{
		this.welcomePref = AppPref.withName('welcomeSeen');
	},

	finish: function()
	{
		if (! this.welcomePref)
		{
			this.welcomePref = new AppPref({ name: 'welcomeSeen' });
			AppPrefCollection.all().add(this.welcomePref);
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
			.on('animationend webkitAnimationEnd MSAnimationEnd', function ()
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

module.exports = WelcomeView;
