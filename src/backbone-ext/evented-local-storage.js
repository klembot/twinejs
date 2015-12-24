/*
# evented-local-storage

A thin wrapper over [Backbone.LocalStorage](1) that emits a `update` event after a
model is successfully saved.

[1]: https://github.com/jeromegn/Backbone.localStorage
*/

'use strict';
var _ = require('underscore');
var LocalStorage = require('backbone.localstorage');

function EventedLocalStorage (name, serializer)
{
	return LocalStorage.call(this, name, serializer);
};

EventedLocalStorage.prototype = new LocalStorage();

_.extend(EventedLocalStorage.prototype,
{
	update: function (model)
	{
		var result = LocalStorage.prototype.update.call(this, model);
		model.trigger('update');
		return result;
	}
});

module.exports = EventedLocalStorage;
