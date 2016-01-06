/*
# pref

Exports a class extending `Backbone.Model` which manages application-level
preferences. As much as is feasible, we store preferences at the story level.
*/

'use strict';
var Backbone = require('backbone');

module.exports = Backbone.Model.extend({
	defaults: {
		name: '',
		value: null
	}
});
