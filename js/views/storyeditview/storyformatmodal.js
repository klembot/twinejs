StoryEditView.StoryFormatModal = Backbone.View.extend(
{
	initialize: function (options)
	{
		this.parent = options.parent;
		this.buttonTemplate = _.template($('.storyFormatButton').html());
		this.detailTemplate = _.template($('.storyFormatDetail').html());
	},

	/**
	 Opens a modal dialog for changing story formats.

	 @method open
	**/

	open: function()
	{
		// begin loading formats immediately

		this.$('.buttons, .details').empty();
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
	 Changes the story's format.

	 @method changeFormat
	**/

	changeFormat: function (name)
	{
		this.parent.model.save({ storyFormat: name });

		// update buttons and details

		this.$('.buttons button.select').each(function()
		{
			var $t = $(this);

			if ($t.data('format') == name)
				$t.addClass('active');
			else
				$t.removeClass('active');
		});

		this.$('.details .detail').each(function()
		{
			var $t = $(this);

			if ($t.data('format') == name)
				$t.css('display', 'block');
			else
				$t.css('display', 'none');
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

			format.load(_.bind(function()
			{
				// skip proofing-only formats

				if (! format.properties.proofing)
				{
					// calculate containing directory for the format
					// so that image URLs, for example, are correct

					var path = format.get('url').replace(/\/[^\/]*?$/, '');
					var fullContent = _.extend(format.properties, { path: path });
					var buttonContent = $(this.buttonTemplate(fullContent));
					var detailContent = $(this.detailTemplate(fullContent));

					this.$('.formats .buttons').append(buttonContent);
					this.$('.formats .details').append(detailContent);

					if (fullContent.name == this.parent.model.get('storyFormat'))
						buttonContent.filter('button.select').addClass('active');
					else
						detailContent.css('display', 'none');
				};

				this.formatsToLoad.remove(format);
				this.loadNextFormat();
			}, this));
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
