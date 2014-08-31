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
 Locates an AppPref by name. If none exists, then this returns null.

 @method withName
 @param {String} name name of the preference
 @static
 @return {AppPref} pref with matching name
 **/

AppPref.withName = function (name)
{
	return AppPrefCollection.all().findWhere({ name: name });
};
