define(['backbone', 'backbone.localstorage', 'models/passage'],

function (Backbone, ls, Passage)
{
	var PassageCollection = Backbone.Collection.extend(
	{
		model: Passage,
		localStorage: new Backbone.LocalStorage('storybook-passages')
	});

	return PassageCollection;
});
