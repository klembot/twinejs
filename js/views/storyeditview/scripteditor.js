/**
 Manages the script editor modal of a StoryEditView.

 @class StoryEditView.ScriptEditor
 @extends Backbone.View
**/

'use strict';

StoryEditView.ScriptEditor = Backbone.View.extend(
{
	initialize: function (options)
	{
		this.parent = options.parent;
		this.scriptEditor = CodeMirror.fromTextArea(this.$('.scriptSource')[0],
		{
			lineWrapping: true,
			lineNumbers: false,
			tabSize: 2,
			indentWithTabs: true,
			mode: 'javascript'
		});

		this.$el.on({
			'modalshown': _.bind(function()
			{
				this.scriptEditor.refresh();
				this.scriptEditor.focus();
			}, this),
			'modalhide': _.bind(function()
			{
				this.save();
			}, this)
		});
	},

	/**
	 Opens a modal dialog for editing the story's script.

	 @method open
	**/

	open: function()
	{
		this.scriptEditor.doc.setValue(this.parent.model.get('script'));
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
		this.parent.model.save({ script: this.scriptEditor.doc.getValue() });
	}
});
