// Shows a list of stories.

StoryListView = Backbone.Marionette.CompositeView.extend({
	itemView: StoryView,
	itemViewContainer: 'tbody',
	template: '#templates .storylistview',

	events:
	{
		'click .add': function()
		{
			this.collection.create({ title: this.$('input.newName').val() });
		}
	}
});
