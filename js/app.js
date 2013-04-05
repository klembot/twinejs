var app = new Backbone.Marionette.Application();

app.addInitializer(function (options)
{
	app.stories = new StoryCollection();
	app.stories.fetch();
	app.passages = new PassageCollection();
	app.passages.fetch();

	app.router = new StorybookRouter();
	Backbone.history.start();

	// default to stories view
	
	if (window.location.hash == '')
		window.location.hash = '#stories';
});

app.addRegions({
	storyListRegion: '#regions .storyList',
	storyEditRegion: '#regions .storyEdit',
	passageEditRegion: '#regions .passageEdit'
});

app.start();
