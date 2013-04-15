require.config({
	urlArgs: 'bust=' +  (new Date()).getTime(),

	paths:
	{
		'jquery': 'lib/jquery',
		'jqueryui': 'lib/jquery.ui',
		'bootstrap': '../bootstrap/js/bootstrap',
		'underscore': 'lib/underscore',
		'json': 'lib/json2',
		'backbone': 'lib/backbone',
		'backbone.localstorage': 'lib/backbone.localstorage',
		'marionette': 'lib/backbone.marionette',
		'blob': 'lib/blob',
		'filesaver': 'lib/filesaver',
	},

	shim:
	{
		'jqueryui':
		{
			deps: ['jquery']
		},
		'underscore':
		{
			exports: '_'
		},
		'json':
		{
			exports: 'JSON'
		},
		'backbone':
		{
			deps: ['underscore', 'json', 'jquery'],
			exports: 'Backbone'
		},
		'marionette':
		{
			deps: ['backbone'],
			exports: 'Marionette'
		},
		'blob':
		{
			exports: 'Blob'
		},
		'filesaver':
		{
			deps: ['blob'],
			exports: 'saveAs'
		}
	}
});

define(['backbone', 'marionette', 'blob', 'filesaver', 'collections/storycollection',
        'collections/passagecollection', 'router'],

function (Backbone, Marionette, Blob, saveAs, StoryCollection, PassageCollection, TwineRouter)
{
	window.app = new Backbone.Marionette.Application({
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

	window.app.addInitializer(function (options)
	{
		window.app.stories = new StoryCollection();
		window.app.stories.fetch();
		window.app.passages = new PassageCollection();
		window.app.passages.fetch();

		window.app.router = new TwineRouter();
		Backbone.history.start();
	});

	window.app.addRegions({
		mainRegion: '#regions .main'
	});

	window.app.start();

	return window.app;
});
