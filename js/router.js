StorybookRouter = Backbone.Router.extend({
	routes:
	{
		'stories': function()
		{
			$(app.storyListRegion.el).css({ display: 'block' });
			$(app.storyEditorRegion.el).css({ display: 'none' });
			app.storyListRegion.show(new StoryListView({ collection: app.stories }));	
		},

		'stories/:id': function (id)
		{
			$(app.storyListRegion.el).css({ display: 'none' });
			$(app.storyEditorRegion.el).css({ display: 'block' });
			app.storyEditorRegion.show(new StoryEditView({ model: app.stories.get(id) }));
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

