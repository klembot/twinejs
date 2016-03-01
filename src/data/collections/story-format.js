/**
 A collection of story formats.

 @class StoryFormatCollection
 @extends Backbone.Collection
**/

'use strict';
var Backbone = require('backbone');

var StoryFormatCollection = Backbone.Collection.extend({
	localStorage: new Backbone.LocalStorage('twine-storyformats')
});

// early export to avoid circular reference problems

module.exports = StoryFormatCollection;
var StoryFormat = require('../models/story-format');

StoryFormatCollection.prototype.model = StoryFormat;

/**
 Returns a collection of all story formats saved.

 @method all
 @return {StoryFormatCollection} a collection of all story formats
 @static
**/

StoryFormatCollection.all = function() {
	var result = new StoryFormatCollection();
	
	result.fetch();
	return result;
};

