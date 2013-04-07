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
		this.$('a[title], button[title]').tooltip();
		this.$('.storyProperties').popover({
			html: true,
			placement: 'bottom',
			content: function() { return $('#storyPropertiesDialog').html() }
		});
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
