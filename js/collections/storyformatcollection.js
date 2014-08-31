/**
 A collection of story formats.

 @class StoryFormatCollection
 @extends Backbone.Collection
**/

'use strict';

var StoryFormatCollection = Backbone.Collection.extend(
{
	model: StoryFormat,
	localStorage: new Backbone.LocalStorage('twine-storyformats')
});

/**
 Returns a collection of all story formats saved.

 @method all
 @return {StoryFormatCollection} a collection of all story formats
 @static
**/

StoryFormatCollection.all = function()
{
	var result = new StoryFormatCollection();
	result.fetch();
	return result;
};
