define(['backbone', 'views/storylistview', 'views/storyeditview'],

function (Backbone, StoryListView, StoryEditView)
{
	var TwineRouter = Backbone.Router.extend(
	{
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

			'*path': function()
			{
				// default route -- show story list
				
				app.mainRegion.show(new StoryListView({ collection: app.stories }));	
			}
		}
	});

	return TwineRouter;
});
