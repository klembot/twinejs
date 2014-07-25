/**
 Manages the toolbar of a StoryEditView.

 @class StoryEditView.Toolbar
 @extends Backbone.View
**/

StoryEditView.Toolbar = Backbone.View.extend(
{
	initialize: function (options)
	{
		this.parent = options.parent;
		this.syncZoomButtons();
	},

	/**
	 Synchronizes the selected state of the zoom buttons with the model.

	 @method syncZoomButtons
	**/

	syncZoomButtons: function()
	{
		var zoom = this.parent.model.get('zoom');

		// select the appropriate toolbar button

		for (var desc in this.parent.ZOOM_MAPPINGS)
			if (this.parent.ZOOM_MAPPINGS[desc] == zoom)
			{
				var radio = this.$('input.zoom' + desc[0].toUpperCase() + desc.substr(1));
				radio.attr('checked', 'checked');
				radio.closest('label').addClass('active');
			};
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

		'click .editStylesheet': 'editStylesheet',

		'change .zoomBig, .zoomMedium, .zoomSmall': function (e)
		{
			var desc = $(e.target).attr('class').replace('zoom', '').toLowerCase();
			this.parent.model.save({ zoom: this.parent.ZOOM_MAPPINGS[desc] }); 
		},
	}
});
