StoryCollection = Backbone.Collection.extend(
{
	model: Story,
	localStorage: new Backbone.LocalStorage('storybook-stories'),
	comparator: function (story)
	{
		return story.get('title');
	}
});
