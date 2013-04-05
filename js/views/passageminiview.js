// Shows an individual passage in the story editor, for dragging around.

PassageMiniView = Marionette.ItemView.extend({
	template: '#templates .passageminiview',

	serializeData: function()
	{
		var data = this.model.toJSON();
		data.excerpt = this.model.excerpt();
		return data;
	},

	events:
	{
		'click .delete': function()
		{
			this.model.destroy();
		},

		'click .edit': function()
		{
			window.location.hash = '#stories/' + this.model.get('story') + '/passage/' + this.model.cid;
		}
	}
});
