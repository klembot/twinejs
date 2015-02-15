/**
 A collection of application preferences.

 @class AppPrefCollection
 @extends Backbone.Collection
**/

'use strict';

var AppPrefCollection = Backbone.Collection.extend(
{
	model: AppPref,
	localStorage: new Backbone.LocalStorage('twine-prefs')
});

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
