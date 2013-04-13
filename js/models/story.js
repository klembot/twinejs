var Story = Backbone.Model.extend({
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

		for (var i = 0; i < passages.length; i++)
			passageData += passages[i].publish();

		return this.template({
			storyName: this.get('name'),
			startNode: this.get('startPassage'),
			appName: app.name,
			appVersion: app.version,
			passageData: passageData
		});
	}
});
