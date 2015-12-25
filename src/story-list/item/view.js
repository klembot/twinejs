/**
 An individual item in the list managed by StoryListView.
 This offers quick links for editing, playing, and deleting
 a story; StoryEditView handles more detailed changes.

 @class StoryItemView
 @extends Marionette.ItemView
**/

'use strict';
var $ = require('jquery');
var Marionette = require('backbone.marionette');
var locale = require('../../locale');
var confirm = require('../../ui/modal/confirm');
var data = require('../../data');
var file = require('../../file');
var notify = require('../../ui/notify');
var prompt = require('../../ui/modal/prompt');
var Passage = require('../../data/passage');
var Preview = require('./preview');
var StoryEditView = require('../../story-edit/view');
var StoryFormat = require('../../data/story-format');
var StoryMenu = require('./menu');
var viewTemplate = require('./view.ejs');

module.exports = Marionette.ItemView.extend(
{
	template: viewTemplate,

	initialize: function (options)
	{
		this.parent = options.parent;
	},

	onDomRefresh: function()
	{
		this.menu = new StoryMenu({ parent: this, trigger: this.$('.showMenu') });
		this.preview = new Preview({ el: this.$('.preview'), parent: this, story: this.model });
	},

	/**
	 Opens a StoryEditView for this story.

	 @method edit
	 @param {Object} e event object, used to animate the transition
	**/

	edit: function (e)
	{
		var proxy = $('<div id="storyEditProxy" class="fullAppear fast"></div>');

		// match the proxy's zoom to the model

		for (var desc in StoryEditView.prototype.ZOOM_MAPPINGS)
			if (StoryEditView.prototype.ZOOM_MAPPINGS[desc] == this.model.get('zoom'))
			{
				proxy.addClass('zoom-' + desc);
				break;
			};

		// if we don't know where the edit event is coming from,
		// default to the center of the window

		var originX = e ? e.pageX : $(window).width() / 2;
		var originY = e ? e.pageY : $(window).height() / 2;

		proxy.css(
		{
			transformOrigin: originX + 'px ' + originY + 'px',
			'-webkit-transform-origin': originX + 'px ' + originY + 'px'
		})
		.one('animationend', function()
		{
			window.location.hash = '#stories/' + this.model.id;
		}.bind(this));

		this.parent.$el.append(proxy);
	},

	/**
	 Plays this story in a new tab.

	 @method play
	**/

	play: function()
	{
		if (Passage.withId(this.model.get('startPassage')) === undefined)
			notify(locale.say('This story does not have a starting point. Edit this story and use the <i class="fa fa-rocket"></i> icon on a passage to set this.'), 'danger');
		else
			window.open('#stories/' + this.model.id + '/play', 'twinestory_play_' + this.model.id);
	},

	/**
	 Tests this story in a new tab.

	 @method test
	**/

	test: function()
	{
		if (Passage.withId(this.model.get('startPassage')) === undefined)
			notify(locale.say('This story does not have a starting point. Edit this story and use the <i class="fa fa-rocket"></i> icon on a passage to set this.'), 'danger');
		else
			window.open('#stories/' + this.model.id + '/test', 'twinestory_test_' + this.model.id);
	},

	/**
	 Publishes the story to a file.

	 @method publish
	**/

	publish: function()
	{
		var format = data.storyFormatForStory(this.model);

		format.publish(this.model, {}, function (err, source)
		{
			file.save(source, this.model.get('name') + '.html');
		}.bind(this));
	},

	/**
	 Shows a confirmation before deleting the model via delete().

	 @method confirmDelete
	**/

	confirmDelete: function()
	{
		confirm(
		{
			content: locale.say('Are you sure you want to delete &ldquo;%s&rdquo;? This cannot be undone.',
			                    this.model.get('name')),
			confirmLabel: '<i class="fa fa-trash-o"></i> ' + locale.say('Delete Forever'),
			confirmClass: 'danger',
			callback: function (confirmed)
			{
				if (confirmed)
					this.delete();
			}.bind(this)
		});
	},

	/**
	 Prompts the user for a new name for the story, then saves it.

	 @method rename
	**/

	rename: function()
	{
		prompt({
			prompt: locale.say('What should &ldquo;%s&rdquo; be renamed to?', this.model.get('name')),
			defaultValue: this.model.get('name'),
			confirmLabel: '<i class="fa fa-ok"></i> ' + locale.say('Rename'),
			callback: function (confirmed, text)
			{
				if (confirmed)
					this.model.save({ name: text });
			}.bind(this)
		});
	},

	/**
	 Prompts the user for a name, then creates a duplicate version of this
	 story accordingly.

	 @method confirmDuplicate
	**/

	confirmDuplicate: function()
	{
		prompt({
			prompt: locale.say('What should the duplicate be named?'),
			defaultValue: locale.say('%s Copy', this.model.get('name')),
			confirmLabel: '<i class="fa fa-copy"></i> ' + locale.say('Duplicate'),
			callback: function (confirmed, text)
			{
				if (confirmed)
					data.duplicateStory(this.model, text);
			}.bind(this)
		});
	},

	/**
	 Deletes the model associated with this view.

	 @method delete
	**/

	delete: function()
	{
		this.$('.story').addClass('disappear').one('animationend', function()
		{
			this.model.destroy();
		}.bind(this));
	},

	display: function()
	{
		this.$('.story').removeClass('hide');
	},

	/**
	 Animates the view appearing, as in when it is newly created.

	 @method appear
	**/

	appear: function()
	{
		this.$('.story').removeClass('hide').addClass('appear');
	},

	/**
	 Animates the view fading in.

	 @method fadeIn
	**/

	fadeIn: function()
	{
		this.$('.story').removeClass('hide').addClass('fadeIn');
	},

	modelEvents:
	{
		'change:name': function()
		{
			this.render();
			this.preview.render();
		}
	},

	events:
	{
		'click .edit': 'edit'
	}
});
