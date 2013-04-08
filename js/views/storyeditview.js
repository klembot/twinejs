// Shows a single story's passages and allows editing.

StoryEditView = Backbone.Marionette.CompositeView.extend({
	itemView: PassageItemView,
	itemViewContainer: '.passages',
	template: '#templates .storyEditView',

	initialize: function (options)
	{
		this.collection = new PassageCollection(app.passages.where({ story: this.model.cid }));

		// keep start passage menu in sync

		var self = this;

		this.collection.on('change:name', function (item)
		{
			self.$('#startPassage option').each(function()
			{
				if ($(this).val() == item.cid)
					$(this).text(item.get('name'));
			});
		});

		this.collection.on('add', function (item)
		{
			self.$('#startPassage').append($('<option value="' + item.cid + '">' + item.get('name') + '</option>'));
		});

		this.collection.on('remove', function (item)
		{
			self.$('#startPassage option').each(function()
			{
				if ($(this).val() == item.cid)
					$(this).remove();
			});
		});
	},

	onRender: function()
	{
		this.$('a[title], button[title]').tooltip();
		this.$('.storyProperties').popover({
			html: true,
			placement: 'bottom',
			content: function() { return $('#storyPropertiesDialog').html() }
		});

		// build the initial start passage menu

		var menu = this.$('#startPassage');

		this.collection.each(function (item)
		{
			menu.append($('<option value="' + item.cid + '">' + item.get('name') + '</option>'));
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
