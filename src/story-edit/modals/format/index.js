'use strict';
var $ = require('jquery');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var locale = require('../../locale');
var notify = require('../../ui/notify');
var StoryFormats = require('../../data/story-formats');
var singleFormatTemplate = require('../ejs/singleStoryFormatItem.ejs');

module.exports = Backbone.View.extend(
{
	initialize: function (options)
	{
		this.parent = options.parent;
		this.itemTemplate = singleFormatTemplate;
	},

	/**
	 Opens a modal dialog for changing story formats.

	 @method open
	**/

	open: function()
	{
		// begin loading formats immediately

		this.$('.formats').empty();
		this.formatsToLoad = StoryFormats.all();
		this.loadNextFormat();

		this.$el.data('modal').trigger('show');
	},

	/**
	 Closes the modal dialog for changing story formats.

	 @method close
	**/

	close: function()
	{
		this.$el.data('modal').trigger('hide');
	},

	/**
	 Changes the story's format.

	 @method changeFormat
	**/

	changeFormat: function (name)
	{
		this.parent.model.save({ storyFormat: name });
		this.$('.detail button.select').each(function()
		{
			var $t = $(this);

			if ($t.closest('.detail').data('format') == name)
				$t.addClass('active');
			else
				$t.removeClass('active');
		});
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

			format.load(function (e)
			{
				if (e === undefined)
				{
					// skip proofing-only formats

					if (! format.properties.proofing)
					{
						// calculate containing directory for the format
						// so that image URLs, for example, are correct

						var path = format.get('url').replace(/\/[^\/]*?$/, '');
						format.properties.path = path;
						var content = $(Marionette.Renderer.render(this.itemTemplate, format.properties));

						this.$('.formats').append(content);

						if (format.properties.name == this.parent.model.get('storyFormat'))
							content.find('button.select').addClass('active');
					};
				}
				else
					// L10n: %1$s is the name of the story format, %2$s is the error message.
					notify(locale.say('The story format &ldquo;%1$s&rdquo; could not be loaded (%2$s).', format.get('name'), e.message), 'danger');

				this.formatsToLoad.remove(format);
				this.loadNextFormat();
			}.bind(this));
		}
		else
			this.$('.loading').hide();
	},

	events:
	{
		'click button.select': function (e)
		{
			this.changeFormat($(e.target).closest('button').data('format'));
		}
	}
});
