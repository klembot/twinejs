// Shows a single story's passages and allows editing.

StoryEditView = Backbone.Marionette.CompositeView.extend({
	itemView: PassageItemView,
	itemViewContainer: '.passages',
	template: '#templates .storyEditView',

	initialize: function (options)
	{
		this.collection = new PassageCollection(app.passages.where({ story: this.model.cid }));
	},

	events:
	{
		'click .add': function()
		{
			this.collection.create({ story: this.model.cid });
		}
	}
});
