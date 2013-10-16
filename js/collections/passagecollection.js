PassageCollection = Backbone.Collection.extend(
{
	model: Passage,
	localStorage: new Backbone.LocalStorage('storybook-passages')
});
