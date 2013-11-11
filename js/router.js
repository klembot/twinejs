TwineRouter = Backbone.Router.extend(
{
	routes:
	{
		'stories': function()
		{
			// list of all stories

			window.app.sync(function()
			{
				window.app.mainRegion.show(new StoryListView({ collection: window.app.stories }));
			});
		},

		'stories/:id': function (id)
		{
			// editing a specific story

			window.app.sync(function()
			{
				window.app.mainRegion.show(new StoryEditView({ model: window.app.stories.get(id) }));
			});
		},

		'stories/:id/play': function (id)
		{
			// play a story

			window.app.sync(function()
			{
				RuntimeTemplate.publish(window.app.stories.get(id), function (html)
				{
					// inject head and body separately -- otherwise DOM errors crop up

					$('head').html(html.substring(html.indexOf('<head>') + 6, html.indexOf('</head>')));
					$('body').html(html.substring(html.indexOf('<body>') + 6, html.indexOf('</body>')));
				});
			});
		},

		'*path': function()
		{
			// default route -- show story list
			
			window.location.hash = '#stories';
		}
	}
});
