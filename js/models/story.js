/**
 A story contains many passages, and has a name, stylesheet, script, zoom,
 and last updated date.

 @class Story
 @extends Backbone.Model
**/


Story = Backbone.Model.extend(
{
	defaults:
	{
		name: 'Untitled Story',
		startPassage: -1,
		zoom: 1,
		snapToGrid: false,
		stylesheet: '',
		script: '',
		lastUpdate: new Date(),
	},

	template: _.template('<tw-storydata name="<%- storyName %>" ' +
						 'startnode="<%- startNode %>" creator="<%- appName %>" ' +
						 'creator-version="<%- appVersion %>">' +
						 '<style role="stylesheet" id="twine-user-stylesheet" type="text/twine-css"><%= stylesheet %></style>' +
						 '<script role="script" id="twine-user-script" type="text/twine-javascript"><%= script %></script>' + 
						 '<%= passageData %></tw-storydata>'),
	
	initialize: function()
	{
		var self = this;

		this.on('destroy', function()
		{
			// delete all child passages

			window.app.passages.fetch(
			{
				success: function (passages)
				{
					var children = passages.where({ story: self.id });

					for (var i = 0; i < children.length; i++)
						children[i].destroy();
				}
			});
		});

		this.on('sync', function()
		{
			// update any passages using our cid as id

			window.app.passages.fetch(
			{
				success: function (passages)
				{
					var children = passages.where({ story: self.cid });

					for (var i = 0; i < children.length; i++)
						children[i].save({ story: self.id });
				}
			});
		});

		// any time we change, update our last updated date
		// we *shouldn't* save ourselves here, since it may not
		// be appropriate yet

		this.on('change', function()
		{
			this.set('lastUpdate', new Date());
		});
	},

	/**
	 Publishes a story to an HTML fragment, e.g. a collection of DOM elements. It's up to a
	 Template to create a full-fledged HTML document from this.

	 @method publish
	 @param {Function} callback Callback function called after finishing the publication process.
	                            This is passed the resulting HTML.
	**/

	publish: function (callback)
	{
		var self = this;

		window.app.passages.fetch({
			success: function (passages)
			{
				var passageData = '';
				var children = passages.where({ story: self.id });
				var startDbId = self.get('startPassage');
				var startId = 1; // last-ditch default, shows first passage defined

				for (var i = 0; i < children.length; i++)
				{
					passageData += children[i].publish(i + 1);
					
					if (children[i].id == startDbId)
						startId = i + 1;
				};

				callback(self.template(
				{
					storyName: self.get('name'),
					startNode: startId,
					appName: window.app.name,
					appVersion: window.app.version,
					passageData: passageData,
					stylesheet: self.get('stylesheet'),
					script: self.get('script')
				}));
			}
		});
	}
});
