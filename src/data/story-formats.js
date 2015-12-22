/**
 A collection of story formats.

 @class StoryFormats
 @extends Backbone.Collection
**/

'use strict';
var Backbone = require('backbone');
var StoryFormat = require('./story-format');

module.exports = Backbone.Collection.extend(
{
	localStorage: new Backbone.LocalStorage('twine-storyformats'),
	model: StoryFormat
});
