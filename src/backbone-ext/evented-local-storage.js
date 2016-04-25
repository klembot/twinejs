/**
 A thin wrapper over Backbone.LocalStorage that emits an event after
 a model is successfully saved.

 @class EventedLocalStorage
**/

'use strict';
const _ = require('underscore');
const LocalStorage = require('backbone.localstorage');

function EventedLocalStorage(name, serializer) {
	return LocalStorage.call(this, name, serializer);
};

EventedLocalStorage.prototype = new LocalStorage();

_.extend(EventedLocalStorage.prototype, {
	update(model) {
		const result = LocalStorage.prototype.update.call(this, model);
	
		/**
		 Triggered after a successful update.

		 @event update
		**/

		model.trigger('update');
		return result;
	}
});

module.exports = EventedLocalStorage;
