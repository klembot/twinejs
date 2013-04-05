// Shows an individual passage in the story editor, for dragging around.

PassageItemView = Marionette.ItemView.extend({
	template: '#templates .passageItemView',

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
			window.location.hash = '#stories/' + this.model.get('story') + '/passages/' + this.model.cid;
		}
	}
});
