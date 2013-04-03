// Renders a single story into the top-level list.

// Shows an individual story list item.

StoryView = Marionette.ItemView.extend({
	tagName: 'li',
	template: '#storyview_template',

	events:
	{
		'click .delete': function()
		{
			this.model.destroy();
		}
	}
});
