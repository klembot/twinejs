/**
 A collection of passages.

 @class PassageCollection
 @extends Backbone.Collection
**/

'use strict';
var Backbone = require('backbone');
var EventedLocalStorage = require('eventedLocalStorage');

var PassageCollection = Backbone.Collection.extend(
{
	model: Passage,
	localStorage: new EventedLocalStorage('twine-passages')
});

// early export to avoid circular reference problems

module.exports = PassageCollection;
var Passage = require('../models/passage');

PassageCollection.prototype.model = Passage;

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

module.exports = PassageCollection;
