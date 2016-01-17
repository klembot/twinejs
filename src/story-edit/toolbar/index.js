/*
# story-edit/toolbar

Manages the toolbar of a story editing view.
*/

'use strict';
var $ = require('jquery');
var Marionette = require('backbone.marionette');
var QuickSearch = require('./search');
var SearchModal = require('../modals/search');
var ToolbarMenu = require('./menu');
var toolbarTemplate = require('./toolbar.ejs');

module.exports = Marionette.ItemView.extend({
	template: toolbarTemplate,

	initialize: function(options) {
		this.parent = options.parent;
		this.model = this.parent.model;
		this.render();
		this.parent.$('#storyEditView').append(this.$el);

		/*
		The view managing the menu attached to the toolbar, summoned by
		clicking or tapping the story name.
		@property menu
		@type `story-edit/toolbar/menu`
		*/
		this.menu = new ToolbarMenu({
			parent: this,
			trigger: this.$('.storyMenu')
		});

		/*
		The view managing the quicksearch field in the toolbar.
		@property quickSearch
		@type `story-edit/toolbar/search`
		*/
		this.quickSearch = new QuickSearch({
			parent: this,
			collectionOwner: this.parent,
			el: this.$('.searchField')
		});

		this.syncZoomButtons();
		this.syncStoryName();
		this.listenTo(this.parent.model, 'change:zoom', this.syncZoomButtons);
		this.listenTo(this.parent.model, 'change:name', this.syncStoryName);
	},

	/*
	Synchronizes the story name shown with the model.

	@method syncStoryName
	*/
	syncStoryName: function() {
		this.$('.storyName').text(this.parent.model.get('name'));
	},

	/*
	Synchronizes the selected state of the zoom buttons with the model.

	@method syncZoomButtons
	*/
	syncZoomButtons: function() {
		var zoom = this.parent.model.get('zoom');

		// Find the correct zoom description.

		for (var desc in this.parent.ZOOM_MAPPINGS) {
			if (this.parent.ZOOM_MAPPINGS[desc] == zoom) {
				var className = desc;
			}
		}

		// Set toolbar active states accordingly.

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

	events: {
		'click .home': function() {
			window.location.hash = 'stories';
		},

		'click .addPassage': function() {
			this.parent.addPassage();
		},

		'click .playStory': function() {
			this.parent.play();
		},

		'click .showSearch': function() {
			new SearchModal().open(this.parent.collection);
		},

		'click .testStory': function() {
			this.parent.test();
		},

		'click .zoomBig, .zoomMedium, .zoomSmall': function(e) {
			var desc = $(e.target).closest('button').attr('class');

			this.parent.model.save({ zoom: this.parent.ZOOM_MAPPINGS[desc] });
		}
	}
});
