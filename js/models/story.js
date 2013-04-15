define(['backbone', 'backbone.localstorage'],

function (Backbone)
{
	var Story = Backbone.Model.extend(
	{
		defaults:
		{
			name: 'Untitled Story',
			startPassage: -1,
		},

		template: _.template('<div data-role="twinestory" data-name="<%- storyName %>" ' +
							 'data-startnode="<%- startNode %>" data-creator="<%- appName %>" ' +
							 'data-creator-version="<%- appVersion %>"><%= passageData %></div>'),
		
		initialize: function()
		{
			this.on('destroy', function()
			{
				// delete all child passages

				var passages = app.passages.where({ story: this.id });

				for (var i = 0; i < passages.length; i++)
					passages[i].destroy();
			});
		},

		publish: function (template)
		{
			var passages = app.passages.where({ story: this.id });
			var passageData = '';
			var startDbId = this.get('startPassage');
			var startId = -1;

			for (var i = 0; i < passages.length; i++)
			{
				passageData += passages[i].publish(i + 1);
				
				if (passages[i].id == startDbId)
					startId = i + 1;
			}

			return this.template({
				storyName: this.get('name'),
				startNode: startId,
				appName: app.name,
				appVersion: app.version,
				passageData: passageData
			});
		}
	});

	return Story;
});
