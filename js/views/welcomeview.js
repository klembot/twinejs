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
		this.$el.addClass('bounceIn');

		this.$el.on('click btn-default', function()
		{

		});
	}
});
