'use strict';


StoryListView.FormatsModal = Backbone.View.extend(
{
	initialize: function (options)
	{
		this.parent = options.parent;
		this.itemTemplate = _.template($('.formatItem').html());
	},

	/**
	 Opens a modal dialog for editing default formats.

	 @method open
	**/

	open: function()
	{
		// begin loading formats immediately

		this.$('.storyFormats, .proofingFormats').empty();
		this.formatsToLoad = StoryFormatCollection.all();
		this.loadNextFormat();

		this.$el.data('modal').trigger('show');
	},

	/**
	 Closes the modal dialog for editing default formats.

	 @method close
	**/

	close: function()
	{
		this.$el.data('modal').trigger('hide');
	},

	/**
	 Incrementally loads information about each story format.
 	 If there are more remaining to be loaded, then this calls itself
	 once the load is complete.

	 @method loadNextFormat
	**/

	loadNextFormat: function()
	{
		if (this.formatsToLoad.length > 0)
		{
			var format = this.formatsToLoad.at(0);

			format.load(_.bind(function()
			{
				// calculate containing directory for the format
				// so that image URLs, for example, are correct

				var path = format.get('url').replace(/\/[^\/]*?$/, '');
				var fullContent = _.extend(format.properties, { path: path });
				var content = $(this.itemTemplate(fullContent));

				if (fullContent.proofing)
					this.$('.proofingFormatList').append(content);
				else
					this.$('.storyFormatList').append(content);

				this.formatsToLoad.remove(format);
				this.loadNextFormat();
			}, this));
		}
		else
		{
			this.syncButtons();
			this.$('.loading').hide();
		};
	},

	/**
	 Removes a story format.

	 @method removeFormat
	 @param {String} name the name of the story format
	**/

	removeFormat: function (name)
	{
		StoryFormat.withName(name).destroy();
	},

	/**
	 Sets the default story format.

	 @method setDefaultFormat
	 @param {String} name the name of the story format
	**/

	setDefaultFormat: function (name)
	{
		AppPref.withName('defaultFormat').save({ value: name });
	},

	/**
	 Sets the default proofing format.

	 @method setProofingFormat
	 @param {String} name the name of the story format
	**/

	setProofingFormat: function (name)
	{
		AppPref.withName('proofingFormat').save({ value: name });
	},

	/**
	 Syncs the active state of setDefault buttons with user preferences.

	 @method syncButtons
	**/

	syncButtons: function()
	{
		var defaultFormat = AppPref.withName('defaultFormat').get('value');
		var proofingFormat = AppPref.withName('proofingFormat').get('value');

		this.$('.storyFormatList .format').each(function()
		{
			var $t = $(this);

			if ($t.data('format') == defaultFormat)
				$t.find('.setDefault').addClass('active');
			else
				$t.find('.setDefault').removeClass('active');
		});

		this.$('.proofingFormatList .format').each(function()
		{
			var $t = $(this);

			if ($t.data('format') == proofingFormat)
				$t.find('.setDefault').addClass('active');
			else
				$t.find('.setDefault').removeClass('active');
		});
	},

	events:
	{
		'click .showRemoveConfirm': function (e)
		{
			var container = $(e.target).closest('.buttons');
			container.find('.normalButtons').hide();
			container.find('.removeConfirm').fadeIn();
		},

		'click .hideRemoveConfirm': function (e)
		{
			var container = $(e.target).closest('.buttons');
			container.find('.normalButtons').fadeIn();
			container.find('.removeConfirm').hide();
		},

		'click .remove': function (e)
		{
			var container = $(e.target).closest('.format');
			this.removeFormat(container.data('format'));
			container.slideUp();
		},

		'click .setDefault': function (e)
		{
			var container = $(e.target).closest('.format');
			var format = container.data('format');
			
			if (container.closest('.storyFormats').length > 0)
				this.setDefaultFormat(format);
			else if (container.closest('.proofingFormats').length > 0)
				this.setProofingFormat(format);
			else
				throw new Error("don't know what kind of format to set as default");

			this.syncButtons();
		}
	}
});
