/**
 Manages showing the user a quick set of intro information, and then
 records that it's been shown.

 @class WelcomeView
 @extends Backbone.Marionette.ItemView
**/

WelcomeView = Backbone.Marionette.ItemView.extend(
{
	template: '#templates .welcomeView',

	initialize: function()
	{
		var self = this;
		window.app.sync(function()
		{
			self.welcomePref = window.app.prefs.findWhere({ name: 'welcomeSeen' });
		});
	},

	finish: function()
	{
		if (! this.welcomePref)
		{
			this.welcomePref = new AppPref({ name: 'welcomeSeen' });
			window.app.prefs.add(this.welcomePref);
		};

		this.welcomePref.save({ value: true });
		window.location.hash = '#stories';
	},

	onRender: function()
	{
		var self = this;

		this.$('div:first-child').css('display', 'block').addClass('appear');

		this.$el.on('click', 'button, a.done', function()
		{
			var $t = $(this);
			var next = $t.closest('div').next('div');

			// fade out existing buttons

			$t.closest('p').addClass('fadeOut');

			// either show the next div, or move on to the story list
			// have to offset the position because we're animating it
			// downward, I think

			if ($t.hasClass('done'))
				self.finish();
			else
			{
				next.css('display', 'block').addClass('slideDown');
				$('body').animate({ scrollTop: next.position().top + 100 });
			};
		});
	}
});
