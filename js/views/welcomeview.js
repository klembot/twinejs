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
		this.$('div:first-child').css('display', 'block').addClass('bounceIn');

		this.$el.on('click', 'button, a.done', function()
		{
			var $t = $(this);
			var div = $t.closest('div');
			var next = div.next('div');

			div.fadeOut(400, function()
			{
				if ($t.hasClass('done'))
					window.location.hash = '#stories';
				else
					next.fadeIn();
			});
		});
	}
});
