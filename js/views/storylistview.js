// Shows a list of stories.

StoryListView = Backbone.Marionette.CompositeView.extend({
	itemView: StoryItemView,
	itemViewContainer: 'tbody',
	template: '#templates .storyListView',

	onRender: function()
	{
		var self = this;

		this.$('a[title], button[title]').tooltip();

		this.$('button.addStory')
		.popover({
			html: true,
			placement: 'bottom',
			content: function() { return $('#addStoryDialog').html() }
		})
		.click(function()
		{
			$('.popover .newName').focus();
		});

	},

	events:
	{
		'click .add': function()
		{
			this.collection.create({ name: this.$('input.newName').val() });
			this.$('.addStory').popover('hide');
		},

		'click .saveArchive': function()
		{
			window.location.hash = '#archive';
		},

		'click .cancelAdd': function()
		{
			this.$('.addStory').popover('hide');
		},

		'click .cancelDelete': function()
		{
			this.$('.deleteStory').popover('hide');
		}
	}
});
