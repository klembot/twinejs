// Shows a single story's passages and allows editing.

StoryEditView = Backbone.Marionette.CompositeView.extend({
	itemView: PassageItemView,
	itemViewContainer: '.passages',
	template: '#templates .storyEditView',

	initialize: function (options)
	{
		this.collection = new PassageCollection(app.passages.where({ story: this.model.cid }));
		var self = this;

		// keep story name in sync

		this.model.on('change:name', function (model)
		{
			self.$('.nav .storyName').text(model.get('name'));
		});

		// keep start passage menu in sync

		this.collection.on('change:name', function (item)
		{
			self.$('select.startPassage option').each(function()
			{
				if ($(this).val() == item.cid)
					$(this).text(item.get('name'));
			});
		});

		this.collection.on('add', function (item)
		{
			self.$('select.startPassage').append($('<option value="' + item.cid + '">' + item.get('name') + '</option>'));
		});

		this.collection.on('remove', function (item)
		{
			self.$('select.startPassage option').each(function()
			{
				if ($(this).val() == item.cid)
					$(this).remove();
			});
		});
	},

	onRender: function()
	{
		var self = this;

		this.$('a[title], button[title]').tooltip();

		// we use #storyPropertiesDialog as a template, but set the values
		// according to the model whenever the popover is shown.

		this.$('.storyProperties')
		.popover({
			html: true,
			placement: 'bottom',
			content: function() { return $('#storyPropertiesDialog').html() }
		})
		.click(function()
		{
			$('.popover input.storyName').val(self.model.get('name'));			
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
		},

		'change #storyName': function()
		{
			this.model.save({ name: this.$('#storyName').val() });
		}
	}
});
