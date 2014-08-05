/**
 A collection of stories. This sorts stories by name by default.

 @class StoryCollection
 @extends Backbone.Collection
**/

StoryCollection = Backbone.Collection.extend(
{
	model: Story,
	localStorage: new Backbone.LocalStorage('twine-stories'),
	order: 'name',
	reverseOrder: false,

	comparator: function (a, b)
	{
		var sortVal;
		
		switch (this.order)
		{
			case 'name':
			sortVal = a.get('name') < b.get('name') ? -1 : 1;
			break;

			case 'lastUpdate':
			var aDate = new Date(a.get('lastUpdate'));
			var bDate = new Date(b.get('lastUpdate'));
			sortVal = aDate.getTime() < bDate.getTime() ? 1 : 1;
			break;
			
			default:
			throw new Error("don't know how to sort stories by " + this.order);
		};

		return sortVal *(this.reverseOrder ? -1 : 1);
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
