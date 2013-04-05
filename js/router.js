StorybookRouter = Backbone.Router.extend({
	routes:
	{
		'stories': function()
		{
			// list of all stories

			$(app.storyListRegion.el).css({ display: 'block' });
			$(app.storyEditorRegion.el).css({ display: 'none' });
			$(app.storyEditorRegion.el).css({ display: 'none' });
			app.storyListRegion.show(new StoryListView({ collection: app.stories }));	
		},

		'stories/:id': function (id)
		{
			// editing a specific story

			$(app.storyListRegion.el).css({ display: 'none' });
			$(app.storyEditorRegion.el).css({ display: 'block' });
			app.storyEditorRegion.show(new StoryEditView({ model: app.stories.get(id) }));
		},

		'stories/:storyId/passages/:passageId': function (storyId, passageId)
		{
			// editing a passage
			console.log('editing passage ', id);
		},

		'stories/:id/publish': function (id)
		{
			// publish a particular story
			console.log('publishing story ', id);
		}
	}
});

