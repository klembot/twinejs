var Story = Backbone.Model.extend({
	defaults:
	{
		name: 'Untitled Story'
	},

	publish: function()
	{
		var passages = app.passages.where({ story: this.cid });
		var result = '<article data-name="' + this.get('name') + '"><h1>' + this.get('name') + '</h1>';

		for (var i = 0; i < passages.length; i++)
			result += passages[i].publish();

		return result + '</article>';
	}
});
