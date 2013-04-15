define(['backbone', 'backbone.localstorage', 'models/story'],

function (Backbone, ls, Story)
{
	var StoryCollection = Backbone.Collection.extend(
	{
		model: Story,
		localStorage: new Backbone.LocalStorage('storybook-stories'),
		comparator: function (story)
		{
			return story.get('title');
		}
	});

	return StoryCollection;
});
