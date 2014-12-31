/**
 This is a data object to record an application-level preference.
 As much as is feasible, we store preferences at the story level.

 @class AppPref
 @extends Backbone.Model
**/

'use strict';

var AppPref = Backbone.Model.extend(
{
	defaults:
	{
		name: '',
		value: null
	}
});

/**
 Locates an AppPref by name. If none exists and a default value is
 specified, then a new model is saved with the default and returned.
 If not, then this returns null.

 @method withName
 @param {String} name name of the preference
 @param defaultVal default value, optional
 @static
 @return {AppPref} pref with matching name
**/

AppPref.withName = function (name, defaultVal)
{
	var allPrefs = AppPrefCollection.all();
	var result = allPrefs.findWhere({ name: name });

	if (result)
		return result;
	else if (defaultVal !== null)
		return allPrefs.create({ name: name, value: defaultVal })
	else
		return;
};
