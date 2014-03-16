/**
 This is a data object to record an application-level preference.
 As much as is feasible, we store preferences at the story level.

 @class AppPref
 @extends Backbone.Model
**/

AppPref = Backbone.Model.extend(
{
	defaults:
	{
		name: '',
		value: null
	}
});
