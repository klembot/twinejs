define(['backbone', 'backbone.localstorage'],

function (Backbone)
{
	var Story = Backbone.Model.extend(
	{
		defaults:
		{
			name: 'Untitled Story',
			startPassage: -1,
			stylesheet: '',
		},

		template: _.template('<div data-role="twinestory" data-name="<%- storyName %>" ' +
							 'data-startnode="<%- startNode %>" data-creator="<%- appName %>" ' +
							 'data-creator-version="<%- appVersion %>"><%= passageData %></div>'),
		
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
		},

		publish: function (callback)
		{
			var self = this;

			window.app.passages.fetch({
				success: function (passages)
				{
					var passageData = '';

					// JavaScript and CSS go at the start

					if (self.get('stylesheet') != '')
						passageData += '<style id="twine-user-stylesheet" type="text/css">' + self.get('stylesheet') + '</style>';

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
						passageData: passageData
					}));
				}
			});
		}
	});

	return Story;
});
