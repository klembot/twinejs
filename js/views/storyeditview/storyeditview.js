/**
 Offers an interface for editing a story. This class is concerned
 with editing the story itself; editing individual passages is handled
 through PassageItemViews. This sets up links from the passage views to
 this one by setting each child's parentView property to this one.

 @class StoryEditView
 @extends Marionette.CompositeView
**/

'use strict';

var StoryEditView = Marionette.CompositeView.extend(
{
	/**
	 Maps numeric zoom settings (that are in our model) to
	 nice adjectives that we use in our CSS.

	 @property ZOOM_MAPPINGS
	 @type Object
	 @final
	**/

	ZOOM_MAPPINGS:
	{
		big: 1,
		medium: 0.6,
		small: 0.25
	},

	childView: PassageItemView,
	childViewContainer: '.passages .content',
	childViewOptions: function() { return { parentView: this }; },
	template: '#templates .storyEditView',

	initialize: function ()
	{
		this.listenTo(this.model, 'change:zoom', this.syncZoom);
		this.listenTo(this.model, 'change:name', this.syncName);
		this.collection = this.model.fetchPassages();
		this.listenTo(this.collection, 'change:top change:left', this.resize)
		.listenTo(this.collection, 'add', function (p)
		{
			// set as starting passage if we only have one

			if (this.collection.length == 1)
				this.model.save({ startPassage: p.cid });
		});
	},

	onShow: function()
	{
		ui.initEl(this.$el);
		this.syncName();

		// enable space bar scrolling

		$(document).on('keydown', _.bind(function (e)
		{
			if (e.keyCode == 32 && $('input:focus, textarea:focus').length == 0)
			{
				this.startMouseScrolling();
				e.preventDefault();
			};
		}, this));

		$(document).on('keyup', _.bind(function (e)
		{
			if (e.keyCode == 32 && $('input:focus, textarea:focus').length == 0)
			{
				this.stopMouseScrolling();
				e.preventDefault();
			};
		}, this));

		// delete selected passages with the delete key

		$(document).on('keyup', _.bind(function (e)
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
					// yikes, localization issues here

					var message = 'Are you sure you want to delete these ' +
					              selected.length + ' passages? This cannot be undone.';

					ui.confirm(message, '<i class="fa fa-trash-o"></i> Delete',
					           _.bind(this.deleteSelectedPassages, this),
					           { buttonClass: 'danger' });
				};
			};
		}, this));

		// automatically focus textareas on edit modals when they are shown

		$(document).on('modalshown', '.editModal', function()
		{
			var textarea = $(this).find('textarea:first');

			if (! textarea.data('codemirror'))
			{
				var textLen = $(textarea).val().length;
				textarea.focus();

				// ugh feature detection
				// http://stackoverflow.com/questions/499126/jquery-set-cursor-position-in-text-area

				if (textarea.setSelectionRange)
					textarea.setSelectionRange(textLen, textLen);
				else if (textarea.createTextRange)
				{
					var range = textarea.createTextRange();
					range.collapse(true);
					range.moveEnd('character', textLen);
					range.moveStart('character', textLen);
					range.select();
				};
			};
		});

		// always hide the story bubble when a click occurs on it
		// (e.g. when a menu item is selected)

		this.$el.on('click', '.storyBubble', function()
		{
			$('.storyBubble').bubble('hide');
		});

		// resize the story map whenever the browser window resizes

		this.resize();
		$(window).on('resize', _.debounce(_.bind(this.resize, this), 500));

		this.syncZoom();
		this.linkManager = new StoryEditView.LinkManager({ el: this.el, parent: this });
		this.toolbar = new StoryEditView.Toolbar({ el: this.$('.toolbar'), parent: this });
		this.passageEditor = new StoryEditView.PassageEditor({ el: this.$('#passageEditModal'), parent: this });
		this.scriptEditor = new StoryEditView.ScriptEditor({ el: this.$('#scriptEditModal'), parent: this });
		this.styleEditor = new StoryEditView.StyleEditor({ el: this.$('#stylesheetEditModal'), parent: this });
		this.search = new StoryEditView.Search({ el: this.$('.searchContainer'), parent: this });
		this.searchModal = new StoryEditView.SearchModal({ el: this.$('#searchModal'), parent: this });
		this.renameModal = new StoryEditView.RenameStoryModal({ el: this.$('#renameStoryModal'), parent: this });
		this.storyFormatModal = new StoryEditView.StoryFormatModal({ el: this.$('#storyFormatModal'), parent: this });

		if (! window.app.hasPrimaryTouchUI())
			this.marquee = new StoryEditView.Marquee({ el: this.$('.passages'), parent: this });

		// if we have no passages in this story, give the user one to start with
		// otherwise, fade in existing

		if (this.collection.length == 0)
			this.addPassage();
		else
			this.$('.passages .content').addClass('fadeIn fast');
	},

	/**
	 Does cleanup of stuff set up in onShow().

	 @method destroy
	 @private
	**/

	destroy: function()
	{
		this.linkManager.destroy();
		$(document).off('keydown');
		$(document).off('keyup');
		$(window).off('resize');
	},

	/**
	 Adds a new passage.

	 @method addPassage
	 @param {String} name name of the passage; defaults to model default
	 @param {Number} left left position; defaults to horizontal center of the window
	 @param {Number} top top position; defaults to vertical center of the window
	**/

	addPassage: function (name, left, top)
	{
		if (! left)
		{
			var offsetX = this.$('.passage:first').width() / 2;
			left = ($(window).scrollLeft() + $(window).width() / 2) - offsetX;
		};

		if (! top)
		{
			var offsetY = this.$('.passage:first').height() / 2;
			top = ($(window).scrollTop() + $(window).height() / 2) - offsetY;
		};

		// make sure the name is unique

		name = name || Passage.prototype.defaults.name;

		if (this.collection.findWhere({ name: name }))
		{
			var origName = name;
			var nameIndex = 0;

			do
				nameIndex++;
			while
				(this.collection.findWhere({ name: origName + ' ' + nameIndex }));

			name = origName + ' ' + nameIndex;
		};

		var passage = this.collection.create({
			name: name,
			story: this.model.id,
			left: left,
			top: top
		}, { wait: true });

		// position the passage so it doesn't overlap any others

		this.positionPassage(passage);
		passage.save();
		this.children.findByModel(passage).appear();
	},

	/**
	 Deletes all currently selected passages.

	 @method deleteSelectedPassages
	**/

	deleteSelectedPassages: function()
	{
		_.invoke(this.children.filter(function (v)
		{
			return v.selected;
		}), 'delete');
	},

	/**
	 Opens a new tab with the playable version of this story. This
	 will re-use the same tab for a particular story.

	 @method play
	**/

	play: function()
	{
		// verify the starting point

		if (Passage.withId(this.model.get('startPassage')) === undefined)
		{
			ui.notify('This story does not have a starting point. Use the <i class="fa fa-rocket"></i> icon on a passage to set this.', 'danger');
			return;
		};

		// try re-using the same window

		var playWindow = window.open('', 'twinestory_play_' + this.model.id);

		if (playWindow.location.href == 'about:blank')
			playWindow.location.href = '#stories/' + this.model.id + '/play';
		else
		{
			playWindow.location.reload();
			ui.notify('Refreshed the playable version of your story in the previously-opened tab or window.');
		};
	},

	/**
	 Opens a new tab with the playable version of this story, in test mode. This
	 will re-use the same tab for a particular story.

	 @method test
	 @param {Number} startId id to start the story on; if unspecified; uses the user-set one
	**/

	test: function (startId)
	{
		var url = '#stories/' + this.model.id + '/test';

		if (startId)
			url += '/' + startId;

		// verify the starting point

		var startOk = false;

		if (! startId)
			startOk = (Passage.withId(this.model.get('startPassage')) !== undefined);
		else
			startOk = (Passage.withId(startId) !== undefined);

		if (! startOk)
		{
			ui.notify('This story does not have a starting point. Use the <i class="fa fa-rocket"></i> icon on a passage to set this.', 'danger');
			return;
		};

		// try re-using the same window

		var testWindow = window.open('', 'twinestory_test_' + this.model.id);
		
		if (testWindow.location.href == 'about:blank')
			testWindow.location.href = url;
		else
		{
			testWindow.location.reload();
			ui.notify('Refreshed the test version of your story in the previously-opened tab or window.');
		};
	},

	/**
	 Opens a new tab with the proofing copy of this story. This
	 will re-use the same tab for a particular story.

	 @method proof
	**/

	proof: function()
	{
		window.open('#stories/' + this.model.id + '/proof', 'twinestory_proof_' + this.model.id);
	},

	/**
	 Publishes the story to a file.	

	 @method publish
	**/

	publish: function (options)
	{
		// verify the starting point

		if (Passage.withId(this.model.get('startPassage')) === undefined)
			ui.notify('This story does not have a starting point. Use the <i class="fa fa-rocket"></i> icon on a passage to set this.', 'danger');
		else
			window.app.publishStory(this.model, this.model.get('name') + '.html');
	},

	/**
	 This resizes the .passages div to either:
		* the size of the browser window
		* the minimum amount of space needed to enclose all existing passages

	 ... whichever is bigger, plus 75% of the browser window's width and height, so
	 that there's always room for the story to expand.

	 This then resizes the view's <canvas> element to match the size of the .passages div,
	 so that lines can be drawn between passage DOM elements properly.

	 @method resize
	**/

	resize: function()
	{
		var winWidth = $(window).width();
		var winHeight = $(window).height();
		var zoom = this.model.get('zoom');
		var width = winWidth;
		var height = winHeight;

		if (this.collection.length > 0)
		{
			var rightPassage = this.collection.max(function (item)
			{
				return item.get('left');
			});

			var bottomPassage = this.collection.max(function (item)
			{
				return item.get('top');
			});

			var passagesWidth = zoom * (rightPassage.get('left') + Passage.width);
			var passagesHeight = zoom * (bottomPassage.get('top') + Passage.height);
			width = Math.max(passagesWidth, winWidth);
			height = Math.max(passagesHeight, winHeight);
		}
		else
		{
			width = winWidth;
			height = winHeight;
		};

		width += winWidth * 0.5;
		height += winHeight * 0.5;

		this.$('.passages').css(
		{
			width: width,
			height: height
		});

		this.$('canvas').attr(
		{
			width: width,
			height: height
		});
	},

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

	/**
	 Nudges a passage so that it does not overlap any other passage in the view,
	 and so that it snaps to the grid if that's set in the model.

	 @method positionPassage
	 @param {Passage} passage Passage to nudge.
	**/

	positionPassage: function (passage)
	{
		// displace

		this.collection.each(function (p)
		{
			if (p.id != passage.id && p.intersects(passage))
			{
				var done = false;
				p.displace(passage);
			};
		});

		// snap to grid

		if (this.model.get('snapToGrid'))
		{
			var xMove, yMove;
			var hGrid = Passage.width / 4;
			var vGrid = Passage.height / 4;

			var leftMove = passage.get('left') % hGrid;

			if (leftMove < hGrid / 2)
				xMove = - leftMove;
			else
				xMove = hGrid - leftMove;

			var upMove = passage.get('top') % vGrid;

			if (upMove < vGrid / 2)
				yMove = - upMove;
			else
				yMove = vGrid - upMove;

			passage.set({ left: passage.get('left') + xMove, top: passage.get('top') + yMove });
		};
	},

	/**
	 Syncs the CSS class associated with the view with model.

	 @method syncZoom
	**/

	syncZoom: function()
	{
		var zoom = this.model.get('zoom');

		for (var desc in this.ZOOM_MAPPINGS)
			if (this.ZOOM_MAPPINGS[desc] == zoom)
			{
				this.$el.removeClass('zoom-small zoom-medium zoom-big').addClass('zoom-' + desc);
				break;
			};
	},

	/**
	 Syncs the window title with the story name.

	 @method syncName
	**/

	syncName: function()
	{
		document.title = 'Editing \u201c' + this.model.get('name') + '\u201d';
	},

	events:
	{
		'drag .passage': function (e)
		{
			// draw links between passages as they are dragged around

			this.linkManager.cachePassage(this.collection.get($(e.target).closest('.passage').attr('data-id')));
			this.linkManager.drawLinks();
		},

		'mousedown': function (e)
		{
			// record the click target

			/**
			 The last element that was the target of a mousedown event.
			 This is used by child views to see if they should pay attention to a
			 mouseup event, for example.

			 @property {jQuery Object} lastMousedown
			**/

			this.lastMousedown = $(e.target);
		}
	},
});
