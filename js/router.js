StorybookRouter = Backbone.Router.extend({
	routes:
	{
		'stories': function()
		{
			// list of all stories

			$(app.storyListRegion.el).css({ display: 'block' });
			$(app.storyEditRegion.el).css({ display: 'none' });
			$(app.passageEditRegion.el).css({ display: 'none' });
			app.storyListRegion.show(new StoryListView({ collection: app.stories }));	
		},

		'stories/:id': function (id)
		{
			// editing a specific story

			$(app.storyListRegion.el).css({ display: 'none' });
			$(app.storyEditRegion.el).css({ display: 'block' }).data('storyId', id);
			$(app.passageEditRegion.el).css({ display: 'none' });
			app.storyEditRegion.show(new StoryEditView({ model: app.stories.get(id) }));
		},

		'stories/:storyId/passages/:passageId': function (storyId, passageId)
		{
			// editing a passage

			$(app.storyListRegion.el).css({ display: 'none' });
			$(app.storyEditRegion.el).css({ display: 'block' });
			$(app.passageEditRegion.el).css({ display: 'block' });

			if ($(app.storyEditRegion.el).data('id') != storyId)
				app.storyEditRegion.show(new StoryEditView({ model: app.stories.get(storyId) }));

			app.passageEditRegion.show(new PassageEditView({ model: app.passages.get(passageId) }));
		},

		'stories/:id/publish': function (id)
		{
			// publish a particular story
			console.log('publishing story ', id);
		}
	}
});

