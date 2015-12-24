/*
# prefs

Exports a class extending `Backbone.Collection` which manages a collection of
preferences.
*/

'use strict';
var Backbone = require('backbone');
var LocalStorage = require('backbone.localstorage');
var Pref = require('./pref');

module.exports = Backbone.Collection.extend(
{
	localStorage: new LocalStorage('twine-prefs'),
	model: Pref
});
