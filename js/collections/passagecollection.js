/**
 A collection of passages.

 @class PassageCollection
 @extends Backbone.Collection
**/


PassageCollection = Backbone.Collection.extend(
{
	model: Passage,
	localStorage: new Backbone.LocalStorage('twine-passages')
});
