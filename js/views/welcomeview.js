/**
 Doesn't do much of anything as yet.

 @class WelcomeView
 @extends Backbone.Marionette.ItemView
**/

WelcomeView = Backbone.Marionette.ItemView.extend(
{
	template: '#templates .welcomeView',

	onRender: function()
	{
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
				window.location.hash = '#stories';
			else
			{
				next.css('display', 'block').addClass('slideDown');
				$('body').animate({ scrollTop: next.position().top + 100 });
			};
		});
	}
});
