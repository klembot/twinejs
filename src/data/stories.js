/*
# stories

Exports a class extending `Backbone.Collection` which manages a collection of
stories. By default, this sorts stories by name, but can also sort by last
update date.
*/

'use strict';
var Backbone = require('backbone');
var locale = require('../locale');
var EventedLocalStorage = require('../backbone-ext/evented-local-storage');
var Story = require('./story');

module.exports = Backbone.Collection.extend(
{
	localStorage: new EventedLocalStorage('twine-stories'),
	model: Story,
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

		return sortVal * (this.reverseOrder ? -1 : 1);
	}
});
