StorybookRouter = Backbone.Router.extend({
	routes:
	{
		'stories': function()
		{
			// list of all stories

			app.mainRegion.show(new StoryListView({ collection: app.stories }));	
			$('a[title], button[title]').tooltip();
		},

		'stories/:id': function (id)
		{
			// editing a specific story

			app.mainRegion.show(new StoryEditView({ model: app.stories.get(id) }));
			$('a[title], button[title]').tooltip();
		},

		'stories/:id/publish': function (id)
		{
			// publish a particular story
			console.log('publishing story ', id);
		},

		'*path': function()
		{
			// default route -- show story list
			app.mainRegion.show(new StoryListView({ collection: app.stories }));	
			$('a[title], button[title]').tooltip();
		}
	}
});

