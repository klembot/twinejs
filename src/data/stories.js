/**
 A collection of stories. This sorts stories by name by default.

 @class Stories
 @extends Backbone.Collection
**/

'use strict';
var Backbone = require('backbone');
var locale = require('../locale');
var EventedLocalStorage = require('../backbone-ext/evented-local-storage');

var Stories = Backbone.Collection.extend(
{
	localStorage: new EventedLocalStorage('twine-stories'),
	order: 'name',
	reverseOrder: false,

	comparator: function (a, b)
	{
		var sortVal;
		
		switch (this.order)
		{
			case 'name':
			sortVal = a.get('name') < b.get('name') ? -1 : 1;
			break;

			case 'lastUpdate':
			var aDate = new Date(a.get('lastUpdate'));
			var bDate = new Date(b.get('lastUpdate'));
			sortVal = aDate.getTime() < bDate.getTime() ? -1 : 1;
			break;
			
			default:
			// L10n: An internal error. %s is a bad sort criterion.
			throw new Error(locale.say("don't know how to sort stories by %s", this.order));
		};

		return sortVal *(this.reverseOrder ? -1 : 1);
	}
});

// early export to avoid circular reference problems

module.exports = Stories;
var Story = require('./story');

Stories.prototype.model = Story;

/**
 Returns a collection of all stories saved.

 @method all
 @return {Stories} a collection of all stories
 @static
**/

Stories.all = function()
{
	var result = new Stories();
	result.fetch();
	return result;
};

