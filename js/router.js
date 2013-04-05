StorybookRouter = Backbone.Router.extend({
	routes:
	{
		'stories': function()
		{
			console.log('listing all stories');
			app.storyListRegion.show(new StoryListView({ collection: app.stories }));	
		},

		'stories/:id': function (id)
		{
			// show editor for particular story
			console.log('editing story ', id);
		},

		'stories/:id/publish': function (id)
		{
			// publish a particular story
			console.log('publishing story ', id);
		},

		'passages/:id': function (id)
		{
			// show editor for particular passage
			console.log('editing passage ', id);
		}
	}
});

