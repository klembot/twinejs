/**
 A collection of story formats.

 @class StoryFormats
 @extends Backbone.Collection
**/

'use strict';
var Backbone = require('backbone');

var StoryFormats = Backbone.Collection.extend(
{
	localStorage: new Backbone.LocalStorage('twine-storyformats')
});

// early export to avoid circular reference problems

module.exports = StoryFormats;
var StoryFormat = require('./story-format');

StoryFormats.prototype.model = StoryFormat;

/**
 Returns a collection of all story formats saved.

 @method all
 @return {StoryFormats} a collection of all story formats
 @static
**/

StoryFormats.all = function()
{
	var result = new StoryFormats();
	result.fetch();
	return result;
};

