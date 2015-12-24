/*
# passages

Exports a class extending `Backbone.Collection` which manages a collection of
passages.
*/

'use strict';
var Backbone = require('backbone');
var EventedLocalStorage = require('../backbone-ext/evented-local-storage');
var Passage = require('./passage');

module.exports = Backbone.Collection.extend(
{
	localStorage: new EventedLocalStorage('twine-passages'),
	model: Passage
});
