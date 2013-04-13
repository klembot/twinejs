StorybookRouter = Backbone.Router.extend({
	routes:
	{
		'stories': function()
		{
			// list of all stories

			app.stories.fetch();
			app.mainRegion.show(new StoryListView({ collection: app.stories }));	
		},

		'stories/:id': function (id)
		{
			// editing a specific story

			app.stories.fetch();
			app.passages.fetch();
			app.mainRegion.show(new StoryEditView({ model: app.stories.get(id) }));
		},

		'stories/:id/play': function (id)
		{
			// play a story

			app.stories.fetch();
			app.passages.fetch();
			$('html').replaceWith(defaultTemplate.publish(app.stories.get(id)));
		},

		'stories/:id/publish': function (id)
		{
			// publish a particular story

			app.stories.fetch();
			app.passages.fetch();
			var story = app.stories.get(id);
			var blob = new Blob([defaultTemplate.publish(story)], { type: 'text/html;charset=utf-8' });
			saveAs(blob, story.get('name') + '.html');
		},

		'*path': function()
		{
			// default route -- show story list
			
			app.mainRegion.show(new StoryListView({ collection: app.stories }));	
		}
	}
});

