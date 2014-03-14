/**
 A collection of stories. This sorts stories by name by default.

 @class StoryCollection
 @extends Backbone.Collection
**/

StoryCollection = Backbone.Collection.extend(
{
	model: Story,
	localStorage: new Backbone.LocalStorage('twine-stories'),
	comparator: function (story)
	{
		return story.get('title');
	}
});
