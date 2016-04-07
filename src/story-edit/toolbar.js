/**
 Manages the toolbar of a StoryEditView.

 @class StoryEditView.Toolbar
 @extends Backbone.View
**/

'use strict';
const $ = require('jquery');
const _ = require('underscore');
const Backbone = require('backbone');
const moment = require('moment');
const locale = require('../locale');
const prompt = require('../ui/prompt');
const StatsModal = require('../modals/story-stats');
const JavaScriptEditor = require('../editors/javascript');
const StylesheetEditor = require('../editors/stylesheet');

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
		const zoom = this.parent.model.get('zoom');

		// find the correct zoom description

		for (let desc in this.parent.ZOOM_MAPPINGS) {
			if (this.parent.ZOOM_MAPPINGS[desc] == zoom) {
				var className = 'zoom' + desc[0].toUpperCase() + desc.substr(1);
			}
		}

		// set toolbar active states accordingly

		this.$('.zooms button').each(function() {
			const $t = $(this);

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
		const menu = this.$('.snapToGrid').closest('li');

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
		const $sn = this.$('.storyName');
		const date = (forceDate) ? moment(forceDate) : moment();

		// L10n: This refers to when a story was last saved by the user
		// %s will be replaced with a localized date and time
		$sn.attr('title', locale.say('Last saved at %s', date.format('llll')));
		$sn.powerTip();
	},

	events: {
		'click .editScript'() {
			new JavaScriptEditor({ data: { model: this.parent.model } }).$mountTo(document.body);
		},

		'click .editStyle'() {
			new StylesheetEditor({ data: { model: this.parent.model } }).$mountTo(document.body);
		},

		'click .renameStory'() {
			const model = this.parent.model;
			prompt({
				message:
					locale.say(
						'What should &ldquo;%s&rdquo; be renamed to?',
						_.escape(model.get('name'))
					),
				buttonLabel:
					'<i class="fa fa-ok"></i> ' + locale.say('Rename'),
				defaultText:
					model.get('name'),
				blankTextError:
					locale.say('Please enter a name.')
			})
			.then((text) => model.save({ name: text }));
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
			new StatsModal({ data: { story: this.parent.model, passages: this.parent.collection.models } }).$mountTo(document.body);
		},

		'click .changeFormat'() {
			this.parent.storyFormatModal.open();
		},

		'click .zoomBig, .zoomMedium, .zoomSmall'(e) {
			let desc = $(e.target).closest('button').attr('class');

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
