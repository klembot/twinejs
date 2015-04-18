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
			ui.notify('This story does not have a starting point. Edit this story and use the <i class="fa fa-rocket"></i> icon on a passage to set this.', 'danger');
		else
			window.open('#stories/' + this.model.id + '/play', 'twinestory_play_' + this.model.id);
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
	 Fades in the view, used to highlight views when the parent view is loaded.

	 @method fadeIn
	**/

	fadeIn: function()
	{
		this.$('.story').show().addClass('fadeIn slideDown').one('animationend', function()
		{
			$(this).removeClass('fadeIn slideDown');
		});
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
		'click .delete': 'delete',
		'click .edit': 'edit',
		'click .play': 'play'
	}
});
