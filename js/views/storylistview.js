// Shows a list of stories.

StoryListView = Backbone.Marionette.CompositeView.extend({
	itemView: StoryItemView,
	itemViewContainer: 'tbody',
	template: '#templates .storyListView',

	onRender: function()
	{
		this.$('a[title], button[title]').tooltip();
	},

	events:
	{
		'click .add': function()
		{
			this.collection.create({ name: this.$('input.newName').val() });
			this.$('#addDialog').modal('hide');
		}
	}
});
