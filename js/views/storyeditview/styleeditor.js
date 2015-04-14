/**
 Manages the stylesheet editor modal of a StoryEditView.

 @class StoryEditView.StyleEditor
 @extends Backbone.View
**/

'use strict';

StoryEditView.StyleEditor = Backbone.View.extend(
{
	initialize: function (options)
	{
		this.parent = options.parent;

		// we have to use the [0] index here because CodeMirror
		// expects a DOM element, not a jQuery object

		this.styleEditor = CodeMirror.fromTextArea(this.$('.stylesheetSource')[0],
		{
			lineWrapping: true,
			lineNumbers: false,
			tabSize: 2,
			indentWithTabs: true,
			mode: 'css'
		});
		this.$('.stylesheetSource:first').data('codemirror', this.styleEditor);

		this.$el.on({
			'modalshown': _.bind(function()
			{
				this.$el.one('animationend', _.bind(function()
				{
					this.styleEditor.refresh();
					this.styleEditor.focus();
				}, this));
			}, this),
			'modalhide': _.bind(function()
			{
				this.save();
			}, this)
		});
	},

	/**
	 Opens a modal dialog for editing the story's stylesheet.

	 @method open
	**/

	open: function()
	{
		this.styleEditor.doc.setValue(this.parent.model.get('stylesheet'));
		this.styleEditor.refresh();
		this.$el.data('modal').trigger('show');
	},

	/**
	 Closes the modal dialog.

	 @method close
	**/

	close: function()
	{
		this.$el.data('modal').trigger('hide');
	},

	/**
	 Saves changes to the model.

	 @method save
	**/

	save: function()
	{
		this.parent.model.save({ stylesheet: this.styleEditor.doc.getValue() });
	}
});
