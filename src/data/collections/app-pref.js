/**
 A collection of application preferences.

 @class AppPrefCollection
 @extends Backbone.Collection
**/

'use strict';
var Backbone = require('backbone');
var LocalStorage = require('backbone.localstorage');

var AppPrefCollection = Backbone.Collection.extend(
{
	model: AppPref,
	localStorage: new LocalStorage('twine-prefs')
});

// early export to avoid circular reference problems

module.exports = AppPrefCollection;
var AppPref = require('../models/app-pref');

AppPrefCollection.prototype.model = AppPref;

/**
 Returns a collection of all prefs saved.

 @method all
 @return {AppPrefCollection} a collection of all prefs
 @static
**/

AppPrefCollection.all = function()
{
	var result = new AppPrefCollection();
	result.fetch();
	return result;
};

