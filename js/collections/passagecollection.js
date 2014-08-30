/**
 A collection of passages.

 @class PassageCollection
 @extends Backbone.Collection
**/


PassageCollection = Backbone.Collection.extend(
{
	model: Passage,
	localStorage: new Backbone.LocalStorage('twine-passages')
});

/**
 Returns a collection of all passages saved.

 @method all
 @return {PassageCollection} a collection of all passages
 @static
**/

PassageCollection.all = function()
{
	var result = new PassageCollection();
	result.fetch();
	return result;
};
