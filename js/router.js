/**
 Handles URL-based routes. These right now are:
 
 * `#stories`: Show a list of all stories.
 * `#stories/[id]`: Edit a particular story.
 * `#stories/[id]/play`: Plays a particular story.
 * `#stories/[id]/proof`: Produces a proofing copy of a particular story.
 
 If a route isn't recognized, this defaults to a list of all stories.

 @class TwineRouter
 @extends Backbone.Router
**/

TwineRouter = Backbone.Router.extend(
{
	routes:
	{
		'welcome': function()
		{
			window.app.mainRegion.show(new WelcomeView());
		},

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

			var self = this;

			window.app.sync(function()
			{
				RuntimeTemplate.publish(window.app.stories.get(id), function (html) { self.replaceContent(html) });
			});
		},

		'stories/:id/proof': function (id)
		{
			// proof a story

			var self = this;

			window.app.sync(function()
			{
				ProofingTemplate.publish(window.app.stories.get(id), function (html) { self.replaceContent(html) });
			});
		},

		'*path': function()
		{
			// default route -- show story list
			
			window.location.hash = '#stories';
		}
	},

	/**
	 Completely replaces the document with HTML source.

	 @method replaceContent
	 @param {String} html HTML source to replace, including DOCTYPE, <head>, and <body>.
	**/

	replaceContent: function (html)
	{
		// inject head and body separately -- otherwise DOM errors crop up

		$('head').html(html.substring(html.indexOf('<head>') + 6, html.indexOf('</head>')));
		$('body').html(html.substring(html.indexOf('<body>') + 6, html.indexOf('</body>')));

	}
});
