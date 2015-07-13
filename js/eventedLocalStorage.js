/**
 A thin wrapper over Backbone.LocalStorage that emits an event after
 a model is successfully saved.

 @class EventedLocalStorage
**/

'use strict';

function EventedLocalStorage (name, serializer)
{
	return Backbone.LocalStorage.call(this, name, serializer);
};

EventedLocalStorage.prototype = new Backbone.LocalStorage();

_.extend(EventedLocalStorage.prototype,
{
	update: function (model)
	{
		var result = Backbone.LocalStorage.prototype.update.call(this, model);
	
		/**
		 Triggered after a successful update.

		 @event update
		**/

		model.trigger('update');
		return result;
	}
});
