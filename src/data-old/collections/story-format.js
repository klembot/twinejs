/**
 A collection of story formats.

 @class StoryFormatCollection
 @extends Backbone.Collection
**/

'use strict';
const Backbone = require('backbone');

const StoryFormatCollection = Backbone.Collection.extend({
	localStorage: new Backbone.LocalStorage('twine-storyformats')
});

// early export to avoid circular reference problems

module.exports = StoryFormatCollection;
const StoryFormat = require('../models/story-format');

StoryFormatCollection.prototype.model = StoryFormat;

/**
 Returns a collection of all story formats saved.

 @method all
 @return {StoryFormatCollection} a collection of all story formats
 @static
**/

StoryFormatCollection.all = () => {
	const result = new StoryFormatCollection();
	
	result.fetch();
	return result;
};

