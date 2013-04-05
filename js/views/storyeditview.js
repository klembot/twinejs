// Shows a single story's passages and allows editing.

StoryEditView = Backbone.Marionette.CompositeView.extend({
	itemView: PassageMiniView,
	itemViewContainer: '.passages',
	template: '#templates .storyeditview',

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
