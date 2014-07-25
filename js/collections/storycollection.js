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

/**
 Returns a collection of all stories saved.

 @method all
 @return {StoryCollection} a collection of all stories
 @static
**/

StoryCollection.all = function()
{
	var result = new StoryCollection();
	result.fetch();
	return result;
};
