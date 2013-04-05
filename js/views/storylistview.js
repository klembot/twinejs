// Shows a list of stories.

StoryListView = Backbone.Marionette.CompositeView.extend({
	itemView: StoryView,
	template: '#templates .storylistview',

	// place item views into our ul

	appendHtml: function (collectionVw, itemVw)
	{
		collectionVw.$('tbody').append(itemVw.el);
	},

	events:
	{
		'click .add': function()
		{
			this.collection.create({ title: this.$('input.newName').val() });
		}
	}
});
