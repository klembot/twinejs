/**
 Offers an interface for editing a story. This class is concerned
 with editing the story itself; editing individual passages is handled
 through PassageItemViews. This sets up links from the passage views to
 this one by setting each child's parentView property to this one.

 @class StoryEditView
 @extends Marionette.CompositeView
**/

StoryEditView = Marionette.CompositeView.extend(
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

	itemView: PassageItemView,
	itemViewContainer: '.passages',
	itemViewOptions: function() { return { parentView: this } },
	template: '#templates .storyEditView',

	initialize: function (options)
	{
		this.collection = new PassageCollection(app.passages.where({ story: this.model.id }));
		this.listenTo(this.collection, 'change:top change:left', this.resize)
		.listenTo(this.collection, 'add', function()
		{
			// set as starting passage if we only have one

			if (this.collection.length == 1)
				this.model.save({ startPassage: item.cid });
		});
	},

	onRender: function()
	{
		var self = this;
		
		// set up tooltips

		this.$('a[title], button[title]').tooltip();

		// enable space bar scrolling

		$(document).on('keydown', function (e)
		{
			if (e.keyCode == 32 && $('input:focus, textarea:focus').length == 0)
			{
				self.startMouseScrolling();
				e.preventDefault();
			};
		});

		$(document).on('keyup', function (e)
		{
			if (e.keyCode == 32 && $('input:focus, textarea:focus').length == 0)
			{
				self.stopMouseScrolling();
				e.preventDefault();
			};
		});

		// automatically focus textareas on edit modals when they are shown

		$(document).on('shown.bs.modal', '.editModal', function()
		{
			var textarea = $(this).find('textarea')[0];
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
		});

		// resize the story map whenever the browser window resizes

		this.resize();
		$(window).on('resize', _.debounce(_.bind(function() { this.resize() }, this), 500));

		this.syncZoom();
		this.linkManager = new StoryEditView.LinkManager({ el: this.el, parent: this });
		this.toolbox = new StoryEditView.Toolbox({ el: this.$('.toolbox'), parent: this });
		this.properties = new StoryEditView.Properties({ el: this.el, parent: this });
		this.passageEditor = new StoryEditView.PassageEditor({ el: this.$('#passageEditModal'), parent: this });
		this.scriptEditor = new StoryEditView.ScriptEditor({ el: this.$('#scriptEditModal'), parent: this });
		this.styleEditor = new StoryEditView.StyleEditor({ el: this.$('#stylesheetEditModal'), parent: this });
	},

	close: function()
	{
		$(document).off('keydown');
	},

	/**
	 Adds a new passage to the center of the view.

	 @method addPassage
	**/

	addPassage: function()
	{
		var offsetX = this.$('.passage:first').width() / 2;
		var offsetY = this.$('.passage:first').height() / 2;

		var passage = new Passage(
		{
			story: this.model.id,
			top: ($(window).scrollTop() + $(window).height() / 2) - offsetY,
			left: ($(window).scrollLeft() + $(window).width() / 2) - offsetX
		});
		
		// catch dupe passage names

		if (! passage.isValid())
		{
			var origName = passage.get('name');
			var untitledIndex = 0;

			do
			{
				passage.set({ name: origName + ' ' + (++untitledIndex) });
			}
			while (! passage.isValid() && passage.validationError == Passage.DUPE_NAME_ERROR.replace('%s', passage.get('name')));
		};

		// position the passage so it doesn't overlap any others

		this.collection.add(passage);
		this.positionPassage(passage);
		passage.save();
		this.children.findByModel(passage).appear();
	},

	/**
	 Opens a new tab with the playable version of this story. This
	 will re-use the same tab for a particular story.

	 @method play
	**/

	play: function()
	{
		window.open('#stories/' + this.model.id + '/play', 'twinestory_play_' + this.model.id);
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
	 Publishes a story by passing control over to TwineApp.publishStory.	

	 @method publish
	**/

	publish: function()
	{
		window.app.publishStory(this.model);
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
		var self = this;

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
				done = false;
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
				this.$el.add('body').removeClass('zoom-small zoom-medium zoom-big').addClass('zoom-' + desc);
				break;
			};
	},

	events:
	{
		'drag .passage': function (event)
		{
			// draw links between passages as they are dragged around

			this.linkManager.cachePassage(this.collection.get($(event.target).closest('.passage').attr('data-id')));
			this.linkManager.drawLinks();
		}
	},
});
