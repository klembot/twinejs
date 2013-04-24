require.config({
	// this is to help with debugging, to prevent caching -- remove for release
	urlArgs: 'bust=' + (new Date()).getTime(),

	paths:
	{
		'jquery': 'lib/jquery',
		'jqueryui': 'lib/jquery.ui',
		'jqueryuitouchpunch': 'lib/jquery.ui.touchpunch',
		'bootstrap': '../bootstrap/js/bootstrap',
		'underscore': 'lib/underscore',
		'json': 'lib/json2',
		'backbone': 'lib/backbone',
		'backbone.localstorage': 'lib/backbone.localstorage',
		'marionette': 'lib/backbone.marionette',
		'blob': 'lib/blob',
		'filesaver': 'lib/filesaver',
		'defaulttemplatesrc': '../defaulttemplate/template'
	},

	shim:
	{
		'bootstrap':
		{
			deps: ['jquery']
		},
		'jqueryui':
		{
			deps: ['jquery', 'jqueryuitouchpunch']
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

define(['backbone', 'marionette', 'blob', 'filesaver', 'models/passage', 'models/story',
        'collections/storycollection', 'collections/passagecollection', 'templates/default', 'router'],

function (Backbone, Marionette, Blob, saveAs, Passage, Story,
          StoryCollection, PassageCollection, defaultTemplate, TwineRouter)
{
	window.app = new Backbone.Marionette.Application({
		name: 'Twine',
		version: '2.0a',

		publishStory: function (story)
		{
			defaultTemplate.publish(story, function (html)
			{
				var blob = new Blob([html], { type: 'text/html;charset=utf-8' });
				saveAs(blob, story.get('name') + '.html');
			});
		},

		saveArchive: function()
		{
			var output = '';
			var stories = this.stories.toArray();
			var i = 0;

			function archiveStory()
			{
				// output, stories, and i are defined above
				
				stories[i].publish(function (html)
				{
					output += html + '\n\n';
					
					if (++i < stories.length)
						archiveStory();
					else
					{
						var blob = new Blob([output], { type: 'text/html;charset=utf-8' });
						saveAs(blob, new Date().toLocaleString().replace(/[\/:\\]/g, '.') + ' Twine Archive.html');
					}
				});
			};

			archiveStory();
		},

		importFile: function (data)
		{
			// parse data into a DOM

			var parsed = $('<html></html>');
			var count = 0;

			// remove surrounding <html>, if there is one

			if (data.indexOf('<html>') != -1)
				parsed.html(data.substring(data.indexOf('<html>') + 6, data.indexOf('</html>')));
			else
				parsed.html(data);

			parsed.find('[data-role="twinestory"]').each(function()
			{
				var $story = $(this);
				var startPassageId = $story.attr('data-startnode');

				// create a story object

				var story = window.app.stories.create({ name: $story.attr('data-name') });

				// and child passages

				$story.find('[data-type="text/markdown"]').each(function()
				{
					var $passage = $(this);
					var posBits = $passage.attr('data-twine-position').split(',');

					passage = window.app.passages.create(
					{
						name: $passage.attr('data-name'),
						text: $passage.html(),
						story: story.id,
						left: parseInt(posBits[0]),
						top: parseInt(posBits[1])
					});	

					if ($passage.attr('data-id') == startPassageId)
						story.save({ startPassage: passage.id });
				});

				count++;
			});

			return count;
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
