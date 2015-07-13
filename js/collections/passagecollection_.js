/**
 A collection of passages.

 @class PassageCollection
 @extends Backbone.Collection
**/

'use strict';

var PassageCollection = Backbone.Collection.extend(
{
	model: Passage,
	localStorage: new EventedLocalStorage('twine-passages')
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
