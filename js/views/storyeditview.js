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
	itemView: PassageItemView,
	itemViewContainer: '.passages',
	itemViewOptions: function() { return { parentView: this } },
	template: '#templates .storyEditView',

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

	initialize: function (options)
	{
		var self = this;

		this.collection = new PassageCollection(app.passages.where({ story: this.model.id }));

		/**
		 Tracks passage positions and links to speed up drawing operations.
		 Call cachePassage() to update a passage in the cache.

		 @property drawCache
		**/

		this.drawCache = {};

		// keep story name in sync
		// we have to force setName() to be called with no args
		// as listenTo() would normally pass it some

		this.listenTo(this.model, 'change:name', function() { this.setName() });

		// keep start passage menu and draw cache in sync

		this.listenTo(this.collection, 'change:name', function (item)
		{
			delete this.drawCache[item.previous('name')];

			this.$('select.startPassage option').each(function()
			{
				if ($(this).val() == item.id || $(this).val() == item.cid)
					$(this).text(item.get('name'));
			});
		})
		.listenTo(this.collection, 'change:top change:left', this.resizeStorymap)
		.listenTo(this.collection, 'change', function (item)
		{
			this.cachePassage(item);

			// any passage that links or linked to this one
			// needs to be re-rendered

			var oldName = item.previous('name');
			var newName = item.get('name');

			this.collection.each(function (item)
			{
				_.some(item.links(), function (link)
				{
					if (link == oldName || link == newName)
					{
						this.children.findByModel(item).render();
						return true;
					};
				}, this);
			}, this);

			this.drawLinks();
		})
		.listenTo(this.collection, 'add', function (item)
		{
			// set as starting passage if we only have one

			if (this.collection.length == 1)
				this.model.save({ startPassage: item.cid });

			this.$('select.startPassage').append($('<option value="' + (item.id || item.cid) +
												 '">' + item.get('name') + '</option>'));
			this.cachePassage(item);
			this.drawLinks();
		})
		.listenTo(this.collection, 'remove', function (item)
		{
			var name = item.get('name');

			delete this.drawCache[name];
			this.drawLinks();

			this.$('select.startPassage option').each(function()
			{
				if ($(this).val() == item.id)
					$(this).remove();
			});

			// any passage that links or linked to this one
			// needs to be re-rendered

			this.collection.each(function (item)
			{
				_.some(item.links(), function (link)
				{
					if (link == name)
					{
						this.children.findByModel(item).render();
						return true;
					};
				}, this);
			}, this);
		});
	},

	onRender: function()
	{
		var self = this;
		
		// set up tooltips

		this.$('a[title], button[title]').tooltip();

		// we use #storyPropertiesDialog as a template, but set the values
		// according to the model whenever the popover is shown.

		this.$('.storyProperties')
		.popover({
			html: true,
			placement: 'left',
			container: '#storyEditView',
			content: function() { return $('#storyPropertiesPopover').html() }
		})
		.click(function()
		{
			// sync data

			self.setSnap();
			self.setName();
			self.setStartPassage();
			$('.popover input.storyName').val(self.model.get('name'));
		});

		// we hide the popover on any click elsewhere

		$('body').on('click', function (e)
		{
			if ($(e.target).closest('.popover, .storyProperties').length == 0)
				$('.storyProperties').popover('hide');
		});

		// build the initial start passage menu

		var menu = this.$('#startPassage');

		this.collection.each(function (item)
		{
			menu.append($('<option value="' + item.id + '">' + item.get('name') + '</option>'));
		});

		// enable space bar scrolling

		$(document).on('keydown', function (e)
		{
			if (e.keyCode == 32)
			{
				self.startMouseScrolling();
				e.preventDefault();
			};
		});

		$(document).on('keyup', function (e)
		{
			if (e.keyCode == 32)
			{
				self.stopMouseScrolling();
				e.preventDefault();
			};
		});

		// resize the story map whenever the browser window resizes

		this.resizeStorymap();
		$(window).on('resize', _.debounce(function() { self.resizeStorymap() }, 500));

		// sync the DOM zoom attributes with the model

		this.setZoom();
		this.setSnap();

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

		// for some reason, jQuery can't see the position of the passages yet, so we defer... kind of

		window.setTimeout(function()
		{
			self.collection.each(function(item) { self.cachePassage(item) });
			self.drawLinks();
		}, 0);
	},

	close: function()
	{
		$(window).off('resize');
		$(document).off('keydown');
	},

	/**
	 Changes the model's snap to grid setting.

	 @method setSnap
	 @param {Boolean} snap Whether to snap to the grid or not.
	                       If omitted, then this simply updates the view.
	**/

	setSnap: function (snap)
	{
		if (snap != null)
			this.model.save({ snapToGrid: snap });
		else
			snap = this.model.get('snapToGrid');

		// have to coerce this to a boolean -- null will take no action

		this.$('.snapToGrid').attr('checked', snap == true);
	},

	/**
	 Changes the model's zoom and updates the view accordingly.

	 @method setZoom
	 @param {Number} zoom New zoom level -- 1 is 100%, 0.5 is 50%.
	                      If omitted, then this simply updates the view.
	**/

	setZoom: function (zoom)
	{
		if (zoom)
			this.model.save({ zoom: zoom });
		else
			zoom = this.model.get('zoom');

		// select the appropriate toolbar button
		// and change CSS class

		for (var desc in this.ZOOM_MAPPINGS)
			if (this.ZOOM_MAPPINGS[desc] == zoom)
			{
				var radio = this.$('input.zoom' + desc[0].toUpperCase() + desc.substr(1));
				radio.attr('checked', 'checked');
				radio.closest('label').addClass('active');
				this.$el.add('body').removeClass('zoom-small zoom-medium zoom-big').addClass('zoom-' + desc);
			};
		
		/**
		 Triggered whenever the zoom level of the view changes.
		 @event zoom 
		**/

	    this.trigger('zoom');

		// all of our cached passage positions are now out of date
		// as is our window size

		this.resizeStorymap();
		this.collection.each(this.cachePassage, this);
	    this.drawLinks();
    },

	/**
	 Sets the model's start passage.

	 @method setStartPassage
	 @param {Number} id id of the passage. If omitted, this simply updates the view.
	**/

	setStartPassage: function (id)
	{
		if (id)
			this.model.save({ startPassage: id });
		else
			id = this.model.get('startPassage');

		$('.startPassage').val(id);
	},

	/**
	 Set the model's name.

	 @method setName
	 @param {String} name New name to set. If omitted, then this simply updates the view.
	**/

	setName: function (name)
	{
		if (name)
			this.model.save({ name: name });
		else
			name = this.model.get('name');

		this.$('.storyName').val(name);
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
	 Opens a modal dialog for editing the story's stylesheet, e.g. #stylesheetModal.
	 This sets .stylesheetSource's value to the current stylesheet.

	 @method editStylesheet
	**/

	editStylesheet: function()
	{
		this.$('.storyProperties').popover('hide');
		
		var stylesheetEditor = this.stylesheetEditor || CodeMirror.fromTextArea(this.$('#stylesheetModal .stylesheetSource')[0], {
			lineWrapping: true,
			lineNumbers: false,
			tabSize: 2,
			indentWithTabs: true,
			mode: 'css',
			autofocus: true
		});
		
		this.stylesheetEditor = stylesheetEditor;
		this.stylesheetEditor.doc.setValue(this.model.get('stylesheet'));
		
		this.$('#stylesheetModal')
		.off('shown.bs.modal')
		.on('shown.bs.modal', function() {
			stylesheetEditor.refresh();
		})
		.modal(
		{
			backdrop: 'static'
		})
	},

	/**
	 Saves changes to the story's stylesheet based on the contents of .stylesheetSource
	 and hides .stylesheetModal.

	 @method setStylesheet
	 @param {String} src Source code for the stylesheet.
	**/

	setStylesheet: function (src)
	{
		this.model.save({ stylesheet: src });
		this.$('#stylesheetModal').modal('hide');
	},

	/**
	 Opens a modal dialog for editing the story's stylesheet, e.g. #scriptModal.
	 This sets .scriptSource's value to the current stylesheet.

	 @method editScript
	**/

	editScript: function()
	{
		this.$('.storyProperties').popover('hide');
		
		var scriptEditor = this.scriptEditor || CodeMirror.fromTextArea(this.$('#scriptModal .scriptSource')[0], {
			lineWrapping: true,
			lineNumbers: false,
			tabSize: 2,
			indentWithTabs: true,
			mode: 'javascript',
			autofocus: true
		});
		
		this.scriptEditor = scriptEditor;
		this.scriptEditor.doc.setValue(this.model.get('script'));
		
		this.$('#scriptModal')
			.off('shown.bs.modal')
			.on('shown.bs.modal', function() {
				scriptEditor.refresh();
			})
			.modal(
			{
				keyboard: false,
				backdrop: 'static'
			});	
	},

	/**
	 Saves changes to the story's script based on the contents of .scriptSource
	 and hides #scriptModal.

	 @method setScript
	 @param {String} src Source code for the script.
	**/

	setScript: function (src)
	{
		this.model.save({ script: src });
		this.$('#scriptModal').modal('hide');	
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
	 Projects a point from the endpoint of a line at a certain angle and distance.
	 
	 @method endPointProjectedFrom
	 @param {Array} line An array of two points, each an object with x and y properties
	 @param {Number} angle Angle in radians to project from the endpoints
	 @param {Number} distance Distance the projected line should have
	**/

    endPointProjectedFrom: function (line, angle, distance)
    {
        var length = Math.sqrt(Math.pow(line[1].x - line[0].x, 2) +
                               Math.pow(line[1].y - line[0].y, 2));

        if (length == 0)
			return line[1];

        // taken from http://mathforum.org/library/drmath/view/54146.html

        var lengthRatio = distance / length;

        var x = line[1].x - ((line[1].x - line[0].x) * Math.cos(angle) -
                             (line[1].y - line[0].y) * Math.sin(angle)) * lengthRatio;
        var y = line[1].y - ((line[1].y - line[0].y) * Math.cos(angle) +
                             (line[1].x - line[0].x) * Math.sin(angle)) * lengthRatio;

        return {x: x, y: y};
    },

	/**
	 Draws arrows between passages to indicate links, using the <canvas> element of this view.

	 @method drawLinks
	**/

	drawLinks: function()
	{
		// canvas properties

		var canvas = this.$('canvas')[0];
		var gc = canvas.getContext('2d');

		// dimensions of a passage

		var width = this.$('.passage:first .frame').outerWidth();
		var height = this.$('.passage:first .frame').outerHeight();

		// configuration of arrowheads
		
		var drawArrows = (this.model.get('zoom') > 0.25);
        var arrowSize = Math.max(width / 8);
		var arrowAngle = Math.PI / 6;

		gc.beginPath();
		gc.clearRect(0, 0, canvas.width, canvas.height);
		gc.strokeStyle = '#7088ac';
		gc.fillStyle = '#7088ac';
		gc.lineWidth = 2;

		for (var name in this.drawCache)
		{
			if (! this.drawCache.hasOwnProperty(name))
				continue;

			var p = this.drawCache[name];

			for (var i = 0; i < p.links.length; i++)
			{
				if (! this.drawCache[p.links[i]])
					continue;
				
				var q = this.drawCache[p.links[i]];

				// p is the start passage; q is the destination
				// find the closest sides to connect

				var xDist = q.position.left - p.position.left;
				var yDist = q.position.top - p.position.top;

				if (Math.abs(xDist) > Math.abs(yDist))
				{
					// connect horizontal sides

					if (xDist > 0)
					{
						// right side of p to left side of q

						var line = [{ x: p.position.left + width, y: p.position.top + height / 2 },
									{ x: q.position.left, y: q.position.top + height / 2 }];
					}
					else
					{
						// left side of p to right side of q

						var line = [{x: p.position.left, y: p.position.top + height / 2 },
									{x: q.position.left + width, y: q.position.top + height / 2 }];
					};
				}
				else
				{
					// connect vertical sides

					if (yDist > 0)
					{
						// bottom side of p to top side of q

						var line = [{x: p.position.left + width / 2, y: p.position.top + height },
									{x: q.position.left + width / 2, y: q.position.top }];
					}
					else
					{
						// top side of p to top side of q

						var line = [{ x: p.position.left + width / 2, y: p.position.top },
									{ x: q.position.left + width / 2, y: q.position.top + height }];
					};
				}

				// line is now an array of two points: 0 is the start, 1 is the end

				var arrow;

				if (drawArrows)
					arrow =
					[
						this.endPointProjectedFrom(line, arrowAngle, arrowSize),
						this.endPointProjectedFrom(line, -arrowAngle, arrowSize)
					];

				// draw it

				gc.moveTo(line[0].x, line[0].y);
				gc.lineTo(line[1].x, line[1].y);

				if (drawArrows)
				{
					gc.moveTo(line[1].x, line[1].y);
					gc.lineTo(arrow[0].x, arrow[0].y);
					gc.moveTo(line[1].x, line[1].y);
					gc.lineTo(arrow[1].x, arrow[1].y);
				};

				gc.closePath();
				gc.stroke();
			};
		};
    },

	/**
	 This resizes the .passages div to either:
		* the size of the browser window
		* the minimum amount of space needed to enclose all existing passages

	 ... whichever is bigger, plus 75% of the browser window's width and height, so
	 that there's always room for the story to expand.

	 This then resizes the view's <canvas> element to match the size of the .passages div,
	 so that lines can be drawn between passage DOM elements properly.

	 @method resizeStorymap
	**/

	resizeStorymap: function()
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

		this.drawLinks();
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
		
		// redraw the links

		var self = this;
		window.setTimeout(function() { self.drawLinks() }, 100);
	},

	/**
	 Updates the draw cache for a passage. This must occur whenever a passage's position,
	 name, or body changes. All of these can affect links drawn.

	 Normally, you don't need to call this manually.

	 @method cachePassage
	 @param {Passage} passage Passage to cache.
	**/

    cachePassage: function (passage)
    {
		var offset = this.$('.passages').offset();
		var pos = this.$('.passages div[data-id="' + passage.id + '"] .frame').offset();

	    // if the passage hasn't been rendered yet, there's nothing to cache yet

	    if (pos)
		    this.drawCache[passage.get('name')] =
		    {
			    position: { left: pos.left - offset.left, top: pos.top - offset.top },
			    links: passage.links()
		    };
    },

	events:
	{
		'change .startPassage': function (e)
		{
			this.setStartPassage($(e.target).val());
		},

		'change .storyName': function (e)
		{
			this.setName($(e.target).val());
		},

		'click .addPassage': 'addPassage',
		'click .playStory': 'play',
		'click .proofStory': 'proof',
		'click .publishStory': 'publish',
		'click .editScript': 'editScript',

		'click .saveScript': function (e)
		{
			this.setScript(this.scriptEditor.doc.getValue());
		},

		'click .editStylesheet': 'editStylesheet',

		'click .saveStylesheet': function (e)
		{
			this.setStylesheet(this.stylesheetEditor.doc.getValue());
		},

		'change .snapToGrid': function (e)
		{
			this.setSnap($(e.target).prop('checked'));
		},

		'change .zoomBig, .zoomMedium, .zoomSmall': function (e)
		{
			var desc = $(e.target).attr('class').replace('zoom', '').toLowerCase();
			this.setZoom(this.ZOOM_MAPPINGS[desc]);
		},

		'drag .passage': function (event)
		{
			// draw links between passages as they are dragged around

			this.cachePassage(this.collection.get($(event.target).closest('.passage').attr('data-id')));
			this.drawLinks();
		}
	},
});
