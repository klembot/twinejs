// Shows an individual story list item.

StoryView = Marionette.ItemView.extend({
	tagName: 'tr',
	template: '#templates .storyview',

	events:
	{
		'click .delete': function()
		{
			this.model.destroy();
		},

		'click .edit': function()
		{
			window.location.hash = '#stories/' + this.model.cid;
		}
	}
});
