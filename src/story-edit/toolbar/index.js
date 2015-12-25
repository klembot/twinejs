/**
 Manages the toolbar of a StoryEditView.

 @class StoryEditView.Toolbar
 @extends Backbone.View
**/

'use strict';
var $ = require('jquery');
var Marionette = require('backbone.marionette');
var moment = require('moment');
var locale = require('../../locale');
var QuickSearch = require('./search');
var SearchModal = require('../modals/search');
var ToolbarMenu = require('./menu');
var toolbarTemplate = require('./toolbar.ejs');

module.exports = Marionette.ItemView.extend(
{
	template: toolbarTemplate,

	initialize: function (options)
	{
		this.parent = options.parent;
		this.model = this.parent.model;
		this.render();
		this.parent.$('#storyEditView').append(this.$el);
		this.menu = new ToolbarMenu({ parent: this, trigger: this.$('.storyMenu') });
		this.quickSearch = new QuickSearch({ parent: this, collectionOwner: this.parent, el: this.$('.searchField') });

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

	syncStoryName: function()
	{
		this.$('.storyName').text(this.parent.model.get('name'));
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
				var className = desc;

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
	 Sets the tooltip of the story menu to indicate that a save has
	 just occurred.

	 @method syncStorySaved
	 @param {Date} forceDate If passed, uses this date instead of the current one
	**/

	syncStorySaved: function (forceDate)
	{
		var $sn = this.$('.storyName');
		var date = (forceDate) ? moment(forceDate) : moment();

		// L10n: This refers to when a story was last saved by the user
		// %s will be replaced with a localized date and time
		$sn.attr('title', locale.say('Last saved at %s', date.format('llll')));
	},

	events:
	{
		'click .home': function()
		{
			window.location.hash = 'stories';
		},

		'click .addPassage': function()
		{
			this.parent.addPassage();
		},

		'click .playStory': function()
		{
			this.parent.play();
		},

		'click .showSearch': function()
		{
			new SearchModal().open(this.parent.collection);
		},

		'click .testStory': function()
		{
			this.parent.test();
		},

		'click .zoomBig, .zoomMedium, .zoomSmall': function (e)
		{
			var desc = $(e.target).closest('button').attr('class');
			this.parent.model.save({ zoom: this.parent.ZOOM_MAPPINGS[desc] });
		}
	}
});
