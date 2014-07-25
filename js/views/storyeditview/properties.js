/**
 Manages the properties popover for a StoryEditView.

 @class StoryEditView.Properties
 @extends Backbone.View
**/

StoryEditView.Properties = Backbone.View.extend(
{
	initialize: function (options)
	{
		this.parent = options.parent;
		this.button = this.$('.storyProperties');

		// use #storyPropertiesPopover as a template, but set the values
		// according to the model whenever the popover is shown

		this.button.popover(
		{
			html: true,
			placement: 'top',
			container: '#storyEditView',
			content: function() { return $('#storyPropertiesPopover').html() },
			trigger: 'manual'
		});

		// build the initial start passage menu

		var menu = this.$('#startPassage');

		this.parent.collection.each(function (item)
		{
			menu.append($('<option value="' + item.id + '">' + item.get('name') + '</option>'));
		});
	},

	open: function()
	{
		this.button.popover('show');

		// sync data
		// have to coerce checkbox state to true or false -- null will have no effect

		$('.popover input.snapToGrid').attr('checked', this.parent.model.get('snapToGrid') == true);
		$('.popover input.storyName').val(this.parent.model.get('name'));
		$('.popover select.startPassage').val(this.parent.model.get('startPassage'));

		// we hide the popover on any click elsewhere

		var self = this;

		$('body').on('click', function (e)
		{
			if ($(e.target).closest('.popover, .storyProperties').length == 0)
				self.close();
		});
	},

	close: function()
	{
		this.button.popover('hide');
	},

	events:
	{
		'change .snapToGrid': function (e)
		{
			this.parent.model.save({ snapToGrid: $(e.target).prop('checked') });
		},

		'change .storyName': function (e)
		{
			this.parent.model.save({ name: $(e.target).val() });
		},

		'change .startPassage': function (e)
		{
			this.parent.model.save({ startPassage: $(e.target).val() });
		},

		'click .editStylesheet': function (e)
		{
			this.close();
			this.parent.styleEditor.open();
		},

		'click .editScript': function (e)
		{
			this.close();
			this.parent.scriptEditor.open();
		}
	}
});
