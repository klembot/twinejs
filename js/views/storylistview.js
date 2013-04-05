// Shows a list of stories.

StoryListView = Backbone.Marionette.CompositeView.extend({
	itemView: StoryItemView,
	itemViewContainer: 'tbody',
	template: '#templates .storyListView',

	events:
	{
		'click .add': function()
		{
			this.collection.create({ title: this.$('input.newName').val() });
		}
	}
});
