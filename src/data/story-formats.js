/*
# story-formats

Exports a class extending `Backbone.Collection` which manages a collection of
story formats.
*/

'use strict';
var Backbone = require('backbone');
var StoryFormat = require('./story-format');

module.exports = Backbone.Collection.extend({
	localStorage: new Backbone.LocalStorage('twine-storyformats'),
	model: StoryFormat
});
