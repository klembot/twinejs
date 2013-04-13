var app = new Backbone.Marionette.Application({
	name: 'Twine',
	version: '2.0a',

	publishStory: function (story)
	{
		var blob = new Blob([defaultTemplate.publish(story)], { type: 'text/html;charset=utf-8' });
		saveAs(blob, story.get('name') + '.html');
	},

	saveArchive: function()
	{
		this.stories.fetch();
		this.passages.fetch();

		var output = '';

		this.stories.each(function (story)
		{
			output += story.publish() + '\n\n';
		});

		var blob = new Blob([output], { type: 'text/html;charset=utf-8' });
		saveAs(blob, new Date().toLocaleString().replace(/[\/:\\]/g, '.') + ' Twine Archive.html');
	}
});

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
