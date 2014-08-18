StoryEditView.StoryFormatModal = Backbone.View.extend(
{
	initialize: function (options)
	{
		this.parent = options.parent;
		this.itemTemplate = _.template($('.storyFormatItem').html());
	},

	/**
	 Opens a modal dialog for changing story formats.

	 @method open
	**/

	open: function()
	{
		// begin loading formats immediately

		this.formatsToLoad = StoryFormatCollection.all();
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
				// skip proofing-only formats

				if (! format.properties.proofing)
				{
					// calculate containing directory for the format
					// so that image URLs, for example, are correct

					var path = format.get('url').replace(/\/[^\/]*?$/, '');

					this.$('.formats').append(this.itemTemplate(_.extend(format.properties, { path: path })));
				};

				this.formatsToLoad.remove(format);
				this.loadNextFormat();
			}, this));
		}
		else
			this.$('.loading').hide();
	}
});
