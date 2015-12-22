/**
 A collection of application preferences.

 @class Prefs
 @extends Backbone.Collection
**/

'use strict';
var Backbone = require('backbone');
var LocalStorage = require('backbone.localstorage');
var Pref = require('./pref');

module.exports = Backbone.Collection.extend(
{
	localStorage: new LocalStorage('twine-prefs'),
	model: Pref
});
