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
		this.parent.model.on('change:zoom', this.syncZoomButtons, this);
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

		'click .zoomBig, .zoomMedium, .zoomSmall': function (e)
		{
			var desc = $(e.target).closest('button').attr('class');
			desc = desc.replace(/^zoom/, '').replace(/ .*/, '').toLowerCase();
			this.parent.model.save({ zoom: this.parent.ZOOM_MAPPINGS[desc] }); 
		},
	}
});
