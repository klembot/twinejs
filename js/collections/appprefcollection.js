/**
 A collection of application preferences.

 @class AppPrefCollection
 @extends Backbone.Collection
**/

AppPrefCollection = Backbone.Collection.extend(
{
	model: AppPref,
	localStorage: new Backbone.LocalStorage('storybook-prefs')
});
