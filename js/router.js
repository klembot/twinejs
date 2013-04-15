define(['jquery', 'backbone', 'views/storylistview', 'views/storyeditview', 'templates/default'],

function ($, Backbone, StoryListView, StoryEditView, defaultTemplate)
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

				// publish to hidden element, then replace head and body
				// this is roundabout, but I'm not sure how else to do it

				var html = defaultTemplate.publish(app.stories.get(id));
				$('head').html(html.substring(html.indexOf('<head>') + 6, html.indexOf('</head>')));
				$('body').html(html.substring(html.indexOf('<body>') + 6, html.indexOf('</body>')));

				/*
				var iframe = $('<iframe></iframe>');
				iframe.css({
					width: '100%',
					height: '80%'
				});
				iframe.attr('src', 'data:text/html;charset=utf-8,' + html);
				$('body').append(iframe);
				*/
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
