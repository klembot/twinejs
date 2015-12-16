'use strict';

		// enable space bar scrolling

		$(document).on('keydown', function (e)
		{
			if (e.keyCode === 32 && $('input:focus, textarea:focus').length === 0)
			{
				this.startMouseScrolling();
				e.preventDefault();
			};
		}.bind(this));

		$(document).on('keyup', function (e)
		{
			if (e.keyCode === 32 && $('input:focus, textarea:focus').length === 0)
			{
				this.stopMouseScrolling();
				e.preventDefault();
			};
		}.bind(this));

		// delete selected passages with the delete key

		$(document).on('keyup', function (e)
		{
			if (e.keyCode == 46)
			{
				var selected = this.children.filter(function (v)
				{
					return v.selected;
				});

				switch (selected.length)
				{
					// bug out if none are selected
					case 0:
					return;

					// immediately delete if it's just one passage
					case 1:
					this.deleteSelectedPassages();
					break;

					// show a confirmation modal if it's more than just 1
					default:

					// set count appropriately

					// L10n: This message is always shown with more than one passage.
					// %d is the number of passages.
					var message = locale.sayPlural('Are you sure you want to delete this passage?',
					                               'Are you sure you want to delete these %d passages? This cannot be undone.',
													   selected.length);

					confirm(message, '<i class="fa fa-trash-o"></i> ' + locale.say('Delete'),
					        this.deleteSelectedPassages.bind(this),
					        { buttonClass: 'danger' });
				};
			};
		}.bind(this));

	/**
	 Begins scrolling the document in response to mouse motion events.

	 @method startMouseScrolling
	**/

	startMouseScrolling: function()
	{
		/**
		 The mouse position that space bar scrolling began at,
		 with x and y properties.

		 @property mouseScrollStart
		 @type Object
		**/

		this.mouseScrollStart = this.mouseScrollStart || {};
		this.mouseScrollStart.x = null;
		this.mouseScrollStart.y = null;
		
		/**
		 The scroll position of the document when space bar scrolling began,
		 with x and y properties.

		 @property pageScrollStart
		 @type Object
		**/

		this.pageScrollStart = this.pageScrollStart || {};
		this.pageScrollStart.x = $(window).scrollLeft();
		this.pageScrollStart.y = $(window).scrollTop();

		$('#storyEditView').addClass('scrolling');
		$(window).on('mousemove', { self: this }, this.mouseScroll);
	},


	/**
	 Stops scrolling the document in response to mouse motion events.

	 @method stopMouseScrolling
	**/

	stopMouseScrolling: function()
	{
		$('#storyEditView').removeClass('scrolling');
		$(window).off('mousemove', this.mouseScroll);
	},

	mouseScroll: function (e)
	{	
		var self = e.data.self;

		if (! self.mouseScrollStart.x && ! self.mouseScrollStart.y)
		{
			// this is our first mouse motion event, record position

			self.mouseScrollStart.x = e.pageX;
			self.mouseScrollStart.y = e.pageY;
		}
		else
		{
			$(window).scrollLeft(self.pageScrollStart.x - (e.pageX - self.mouseScrollStart.x));
			$(window).scrollTop(self.pageScrollStart.y - (e.pageY - self.mouseScrollStart.y));
		};
	},
