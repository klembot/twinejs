var app = new Backbone.Marionette.Application();

app.addInitializer(function (options)
{
	app.stories = new StoryCollection();
	app.stories.fetch();
	app.passages = new PassageCollection();
	app.passages.fetch();

	app.router = new StorybookRouter();
	Backbone.history.start();
});

app.addRegions({
	mainRegion: '#regions .main'
});

app.start();
