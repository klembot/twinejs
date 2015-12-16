/**
 A collection of application preferences.

 @class Prefs
 @extends Backbone.Collection
**/

'use strict';
var Backbone = require('backbone');
var LocalStorage = require('backbone.localstorage');

var Prefs = Backbone.Collection.extend(
{
	localStorage: new LocalStorage('twine-prefs')
});

// early export to avoid circular reference problems

module.exports = Prefs;
var Pref = require('./pref');

Prefs.prototype.model = Pref;

/**
 Returns a collection of all prefs saved.

 @method all
 @return {Prefs} a collection of all prefs
 @static
**/

Prefs.all = function()
{
	var result = new Prefs();
	result.fetch();
	return result;
};

