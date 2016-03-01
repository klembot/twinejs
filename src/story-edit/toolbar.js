/**
 Manages the toolbar of a StoryEditView.

 @class StoryEditView.Toolbar
 @extends Backbone.View
**/

'use strict';
var $ = require('jquery');
var Backbone = require('backbone');
var moment = require('moment');
var locale = require('../locale');

module.exports = Backbone.View.extend({
	initialize(options) {
		this.parent = options.parent;
		this.syncZoomButtons();
		this.syncStorySaved();
		this.listenTo(this.parent.model, 'change:zoom', this.syncZoomButtons);
		this.listenTo(this.parent.model, 'change:name', this.syncStoryName);
		this.listenTo(this.parent.model, 'update', this.syncStorySaved);
		this.listenTo(this.parent.collection, 'update', this.syncStorySaved);
	},

	/**
	 Synchronizes the story name shown with the model.

	 @method syncStoryName
	**/

	syncStoryName() {
		this.$('.storyNameVal').text(this.parent.model.get('name'));
	},

	/**
	 Synchronizes the selected state of the zoom buttons with the model.

	 @method syncZoomButtons
	**/

	syncZoomButtons() {
		var zoom = this.parent.model.get('zoom');

		// find the correct zoom description

		for (var desc in this.parent.ZOOM_MAPPINGS) {
			if (this.parent.ZOOM_MAPPINGS[desc] == zoom) {
				var className = 'zoom' + desc[0].toUpperCase() + desc.substr(1);
			}
		}

		// set toolbar active states accordingly

		this.$('.zooms button').each(function() {
			var $t = $(this);

			if ($t.hasClass(className)) {
				$t.addClass('active');
			}
			else {
				$t.removeClass('active');
			}
		});
	},

	/**
	 Synchronizes the checked state of the Snap to Grid menu item with the
	 model.

	 @method syncSnapToGrid
	**/

	syncSnapToGrid() {
		var menu = this.$('.snapToGrid').closest('li');

		if (this.parent.model.get('snapToGrid')) {
			menu.addClass('checked');
		}
		else {
			menu.removeClass('checked');
		}
	},

	/**
	 Sets the tooltip of the story menu to indicate that a save has
	 just occurred.

	 @method syncStorySaved
	 @param {Date} forceDate If passed, uses this date instead of the current
		 one
	**/

	syncStorySaved(forceDate) {
		var $sn = this.$('.storyName');
		var date = (forceDate) ? moment(forceDate) : moment();

		// L10n: This refers to when a story was last saved by the user
		// %s will be replaced with a localized date and time
		$sn.attr('title', locale.say('Last saved at %s', date.format('llll')));
		$sn.powerTip();
	},

	events: {
		'click .editScript'() {
			this.parent.scriptEditor.open();
		},

		'click .editStyle'() {
			this.parent.styleEditor.open();
		},

		'click .renameStory'() {
			this.parent.renameModal.open();
		},

		'click .addPassage'() {
			this.parent.addPassage();
		},

		'click .testStory'() {
			this.parent.test();
		},

		'click .playStory'() {
			this.parent.play();
		},

		'click .proofStory'() {
			this.parent.proof();
		},

		'click .publishStory'() {
			this.parent.publish();
		},

		'click .storyStats'() {
			this.parent.statsModal.open();
		},

		'click .changeFormat'() {
			this.parent.storyFormatModal.open();
		},

		'click .zoomBig, .zoomMedium, .zoomSmall'(e) {
			var desc = $(e.target).closest('button').attr('class');

			desc = desc.replace(/^zoom/, '').replace(/ .*/, '').toLowerCase();
			this.parent.model.save({ zoom: this.parent.ZOOM_MAPPINGS[desc] });
		},

		'click .snapToGrid'() {
			this.parent.model.save({
				snapToGrid: !this.parent.model.get('snapToGrid')
			});
		},

		'bubbleshow .storyBubble': 'syncSnapToGrid'
	}
});
