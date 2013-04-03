// Shows a list of stories.

StoriesView = Backbone.Marionette.CollectionView.extend({
	el: '#stories',
	itemView: StoryView,

	// place item views into our ul

	appendHtml: function (collectionVw, itemVw)
	{
		collectionVw.$('ul').append(itemVw.el);
	},

	events:
	{
		'click .add': function()
		{
			this.collection.create({ title: this.$('#newName').val() });
		}
	}
});
