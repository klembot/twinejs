/**
 An individual item in the list managed by StoryListView.
 This offers quick links for editing, playing, and deleting 
 a story; StoryEditView handles more detailed changes.

 @class StoryItemView
 @extends Marionette.ItemView
**/

'use strict';

var StoryItemView = Marionette.ItemView.extend(
{
	template: '#templates .storyItemView',

	initialize: function (options)
	{
		this.parentView = options.parentView;
		this.passages = options.passages;
		this.listenTo(this.model, 'change:name', function()
		{
			this.render();
			this.preview.renderPassages();
		});
	},

	onDomRefresh: function()
	{
		this.preview = new StoryItemView.Preview({ el: this.$('.preview'), parent: this });
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

		this.parentView.$el.append(proxy);
	},

	/**
	 Plays this story in a new tab.

	 @method play
	**/

	play: function()
	{
		if (Passage.withId(this.model.get('startPassage')) === undefined)
			ui.notify(window.app.say('This story does not have a starting point. Edit this story and use the <i class="fa fa-rocket"></i> icon on a passage to set this.'), 'danger');
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
			ui.notify(window.app.say('This story does not have a starting point. Edit this story and use the <i class="fa fa-rocket"></i> icon on a passage to set this.'), 'danger');
		else
			window.open('#stories/' + this.model.id + '/test', 'twinestory_test_' + this.model.id);
	},

	/**
	 Downloads the story to a file.

	 @method publish
	**/

	publish: function()
	{
		// verify the starting point

		if (Passage.withId(this.model.get('startPassage')) === undefined)
			ui.notify(window.app.say('This story does not have a starting point. Use the <i class="fa fa-rocket"></i> icon on a passage to set this.'), 'danger');
		else
			window.app.publishStory(this.model, this.model.get('name') + '.html');
	},

	/**
	 Shows a confirmation before deleting the model via delete().

	 @method confirmDelete
	**/

	confirmDelete: function()
	{
		window.ui.confirm(window.app.say("Are you sure you want to delete &ldquo;%s&rdquo;? This cannot be undone.",
		                  this.model.get('name')),
		                  '<i class="fa fa-trash-o"></i> ' + window.app.say('Delete Forever'),
						  this.delete.bind(this), { buttonClass: 'danger' });
	},

	/**
	 Prompts the user for a new name for the story, then saves it.

	 @method rename
	**/

	rename: function()
	{
		window.ui.prompt(window.app.say("What should &ldquo;%s&rdquo; be renamed to?", this.model.get('name')),
		                 '<i class="fa fa-ok"></i> ' + window.app.say('Rename'),
						 function (text)
						 {
						 	this.model.save({ name: text });
						 }.bind(this),
						 { defaultText: this.model.get('name') });
	},

	/**
	 Prompts the user for a name, then creates a duplicate version of this
	 story accordingly.

	 @method confirmDuplicate
	**/

	confirmDuplicate: function()
	{
		window.ui.prompt(window.app.say("What should the duplicate be named?"),
		                 '<i class="fa fa-copy"></i> ' + window.app.say('Duplicate'),
						 function (text)
						 {
						 	var dupe = this.model.duplicate(text);
							this.parentView.collection.add(dupe);
						 }.bind(this),
						 { defaultText: window.app.say('%s Copy', this.model.get('name')) });
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

	/**
	 Animates the view appearing, as in when it is newly created.

	 @method appear
	**/

	appear: function()
	{
		this.$('.story').addClass('appear');
	},

	events:
	{
		'click .confirmDelete': 'confirmDelete',
		'click .confirmDuplicate': 'confirmDuplicate',
		'click .rename': 'rename',
		'click .edit': 'edit',
		'click .play': 'play',
		'click .test': 'test',
		'click .publish': 'publish'
	}
});
