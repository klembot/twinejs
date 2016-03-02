/**
 A collection of application preferences.

 @class AppPrefCollection
 @extends Backbone.Collection
**/

'use strict';
const Backbone = require('backbone');
const LocalStorage = require('backbone.localstorage');

const AppPrefCollection = Backbone.Collection.extend({
	// AppPref is manually added below
	localStorage: new LocalStorage('twine-prefs')
});

// early export to avoid circular reference problems

module.exports = AppPrefCollection;
const AppPref = require('../models/app-pref');

AppPrefCollection.prototype.model = AppPref;

/**
 Returns a collection of all prefs saved.

 @method all
 @return {AppPrefCollection} a collection of all prefs
 @static
**/

AppPrefCollection.all = () => {
	const result = new AppPrefCollection();

	result.fetch();
	return result;
};

