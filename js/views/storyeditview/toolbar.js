/**
 Manages the toolbar of a StoryEditView.

 @class StoryEditView.Toolbar
 @extends Backbone.View
**/

'use strict';

StoryEditView.Toolbar = Backbone.View.extend(
{
	initialize: function (options)
	{
		this.parent = options.parent;
		this.syncZoomButtons();
		this.parent.model.on('change:zoom', this.syncZoomButtons, this);
		this.parent.model.on('change:name', this.syncStoryName, this);
	},

	/**
	 Synchronizes the story name shown with the model.

	 @method syncStoryName
	**/

	syncStoryName: function()
	{
		this.$('.storyNameVal').text(this.parent.model.get('name'));
	},

	/**
	 Synchronizes the selected state of the zoom buttons with the model.

	 @method syncZoomButtons
	**/

	syncZoomButtons: function()
	{
		var zoom = this.parent.model.get('zoom');

		// find the correct zoom description

		for (var desc in this.parent.ZOOM_MAPPINGS)
			if (this.parent.ZOOM_MAPPINGS[desc] == zoom)
				var className = 'zoom' + desc[0].toUpperCase() + desc.substr(1);

		// set toolbar active states accordingly

		this.$('.zooms button').each(function()
		{
			var $t = $(this);

			if ($t.hasClass(className))
				$t.addClass('active');
			else
				$t.removeClass('active');
		});
	},

	/**
	 Synchronizes the checked state of the Snap to Grid menu item with the model.

	 @method syncSnapToGrid
	**/

	syncSnapToGrid: function()
	{
		var menu = this.$('.snapToGrid').closest('li');

		if (this.parent.model.get('snapToGrid'))
			menu.addClass('checked');
		else
			menu.removeClass('checked');
	},

	events:
	{
		'click .editScript': function (e)
		{
			this.parent.scriptEditor.open();
		},

		'click .editStyle': function (e)
		{
			this.parent.styleEditor.open();
		},

		'click .renameStory': function (e)
		{
			this.parent.renameModal.open();
		},

		'click .addPassage': function (e)
		{
			this.parent.addPassage();
		},

		'click .testStory': function (e)
		{
			this.parent.test();
		},

		'click .playStory': function (e)
		{
			this.parent.play();
		},

		'click .proofStory': function (e)
		{
			this.parent.proof();
		},

		'click .publishStory': function (e)
		{
			this.parent.publish();
		},

		'click .storyProperties': function (e)
		{
			this.parent.properties.open();
		},

		'click .changeFormat': function (e)
		{
			this.parent.storyFormatModal.open();
		},

		'click .zoomBig, .zoomMedium, .zoomSmall': function (e)
		{
			var desc = $(e.target).closest('button').attr('class');
			desc = desc.replace(/^zoom/, '').replace(/ .*/, '').toLowerCase();
			this.parent.model.save({ zoom: this.parent.ZOOM_MAPPINGS[desc] }); 
		},

		'click .snapToGrid': function()
		{
			this.parent.model.save({ snapToGrid: ! this.parent.model.get('snapToGrid') });
		},

		'bubbleshow .storyBubble': 'syncSnapToGrid'
	}
});
