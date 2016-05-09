/**
 A collection of passages.

 @class PassageCollection
 @extends Backbone.Collection
**/

'use strict';
const Backbone = require('backbone');
const EventedLocalStorage = require('../../backbone-ext/evented-local-storage');

const PassageCollection = Backbone.Collection.extend({
	localStorage: new EventedLocalStorage('twine-passages')
});

// early export to avoid circular reference problems

module.exports = PassageCollection;
const Passage = require('../models/passage');

PassageCollection.prototype.model = Passage;

/**
 Returns a collection of all passages saved.

 @method all
 @return {PassageCollection} a collection of all passages
 @static
**/

PassageCollection.all = () => {
	const result = new PassageCollection();

	result.fetch();
	return result;
};

module.exports = PassageCollection;
