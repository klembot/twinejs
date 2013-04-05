// Shows a single story's passages and allows editing.

StoryEditView = Backbone.Marionette.CompositeView.extend({
	itemView: PassageItemView,
	itemViewContainer: '.passages',
	template: '#templates .storyEditView',

	initialize: function (options)
	{
		this.collection = new PassageCollection(app.passages.where({ story: this.model.cid }));
	},

	onRender: function()
	{
		console.log(this.$('.passages > div'));
		this.$('.passages > div').draggable();
	},

	events:
	{
		'click .add': function()
		{
			this.collection.create({ story: this.model.cid });
		},
		
		'click .savePassage': function()
		{
			var model = this.collection.get($('#passageId').val());
			model.save({
				name: $('#passageName').val(),
				text: $('#passageText').val()
			});

			$('#passageEditDialog').modal('hide');
		}
	}
});
