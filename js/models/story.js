var Story = Backbone.Model.extend({
	defaults:
	{
		name: 'Untitled Story',
		startPassage: -1
	},
	
	initialize: function()
	{
		this.on('destroy', function()
		{
			// delete all child passages

			var passages = app.passages.where({ story: this.cid });

			for (var i = 0; i < passages.length; i++)
				passages[i].destroy();
		});
	},

	publish: function()
	{
		var passages = app.passages.get(this.id);
		var result = '<article data-name="' + this.get('name') + '" data-start-passage="' +
					 this.get('startPassage') + '"><h1>' + this.get('name') + '</h1>';

		for (var i = 0; i < passages.length; i++)
			result += passages[i].publish();

		return result + '</article>';
	}
});
