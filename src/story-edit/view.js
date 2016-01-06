/*
# story-edit/view

Offers an interface for editing a story. This class is concerned with editing
the story itself; editing individual passages is handled through
`story-edit/item`. This sets up links from the passage views to this one by
setting each child's parentView property to this one.
*/

'use strict';
var $ = require('jquery');
var _ = require('underscore');
var moment = require('moment');
var Marionette = require('backbone.marionette');
var data = require('../data');
var file = require('../file');
var locale = require('../locale');
var keyboardDeletion = require('./keyboard-deletion');
var mouseScrolling = require('./mouse-scrolling');
var notify = require('../ui/notify');
var ui = require('../ui');
var LinkManager = require('./link-manager');
var Toolbar = require('./toolbar');
var Marquee = require('./marquee');
var Passage = require('../data/passage');
var PassageItemView = require('./item/view');
var viewTemplate = require('./view.ejs');

module.exports = Marionette.CompositeView.extend({
	/*
	Maps numeric zoom settings (that are in our model) to
	nice adjectives that we use in our CSS.

	@property ZOOM_MAPPINGS
	@type {Object}
	*/
	ZOOM_MAPPINGS: {
		zoomBig: 1,
		zoomMedium: 0.6,
		zoomSmall: 0.25
	},

	childView: PassageItemView,

	childViewContainer: '.passages .content',

	childViewOptions: function() {
		return {parentView: this};
	},

	template: viewTemplate,

	initialize: function() {
		this.collection = data.passagesForStory(this.model);

		/*
		We must save this reference because `Function.bind()` returns different
		references on each call, and we need this in order to properly unbind
		in `onDestroy`.
		*/

		this.onMouseWheelBound = this.onMouseWheel.bind(this);
		$(document).on('wheel', this.onMouseWheelBound);

		this.zoomLevels = _.values(this.ZOOM_MAPPINGS).sort();
	},

	onShow: function() {
		this.syncName();
		this.syncZoom();

		// Resize the story map whenever the browser window resizes.

		this.resize();
		$(window).on('resize', _.debounce(this.resize.bind(this), 500));

		// Attach our interface helpers.

		keyboardDeletion.attach(this);
		mouseScrolling.attach();

		this.linkManager = new LinkManager({el: this.el, parent: this});
		this.toolbar = new Toolbar({parent: this});

		// On mouse-based devices, add our selection marquee.

		if (! ui.hasPrimaryTouchUI()) {
			this.marquee = new Marquee({ el: this.$('.passages'), parent: this });
		}

		/*
		If we have no passages in this story, give the user one to start with.
		Otherwise, fade in the existing ones.
		*/

		if (this.collection.length === 0) {
			this.addPassage();
		}
		else {
			this.$('.passages .content').addClass('fadeIn fast');
		}
	},

	/*
	Does cleanup of stuff set up in `onShow()`.

	@method onDestroy
	*/

	onDestroy: function() {
		this.linkManager.destroy();
		keyboardDeletion.detach();
		mouseScrolling.detach();
		$(window).off('resize');
		$(document).off('wheel', this.onMouseWheelBound);
	},

	/*
	Adds a new passage.

	@method addPassage
	@param {String} [name] name of the passage; defaults to model default
	@param {Number} [left] left position; defaults to horizontal center of the
		window
	@param {Number} [top] top position; defaults to vertical center of the window
	*/

	addPassage: function(name, left, top) {
		var zoom = this.model.get('zoom');
		var $win = $(window);

		// If coordinates aren't specified, calculate the center.

		if (! left) {
			var offsetX = this.$('.passage:first').width() / 2;

			left = (($win.scrollLeft() + $win.width() / 2) / zoom) - offsetX;
		}

		if (! top) {
			var offsetY = this.$('.passage:first').height() / 2;

			top = (($win.scrollTop() + $win.height() / 2) / zoom) - offsetY;
		}

		// Make sure the name is unique by adding numbers to its end.

		name = name || Passage.prototype.defaults().name;

		if (this.collection.findWhere({name: name})) {
			var origName = name;
			var nameIndex = 0;

			do {
				nameIndex++;
			}
			while (this.collection.findWhere({name: origName + ' ' + nameIndex}));

			name = origName + ' ' + nameIndex;
		}

		// Create the passage.

		var passage = data.passages.create({
			name: name,
			story: this.model.id,
			left: left,
			top: top
		}, { wait: true });

		this.collection.add(passage);

		// Position the passage so it doesn't overlap any others.

		this.positionPassage(passage);
		passage.save();

		// Animate it appearing.

		this.children.findByModel(passage).appear();
	},

	/*
	Deletes all currently selected passages.

	@method deleteSelectedPassages
	*/
	deleteSelectedPassages: function() {
		_.invoke(this.children.filter(function(v) {
			return v.selected;
		}), 'delete');
	},

	/*
	Opens a new tab with the playable version of this story. This
	will re-use the same tab for a particular story.

	@method play
	*/
	play: function() {
		// Make sure a starting point is set.

		if (data.passage(this.model.get('startPassage')) === undefined) {
			notify(
				locale.say(
					'This story does not have a starting point. ' +
					'Use the <i class="fa fa-rocket"></i> icon on a passage to set this.'
				),
				'danger'
			);
			return;
		}

		// Try re-using the same window.

		var playWindow = window.open('', 'twinestory_play_' + this.model.id);

		if (playWindow.location.href == 'about:blank') {
			playWindow.location.href = '#stories/' + this.model.id + '/play';
		}
		else {
			playWindow.location.reload();
			notify(
				locale.say(
					'Refreshed the playable version of your story in the ' +
					'previously-opened tab or window.'
				)
			);
		}
	},

	/*
	Opens a new tab with the playable version of this story, in test mode. This
	will re-use the same tab for a particular story.

	@method test
	@param {Number} [startId] id to start the story on; if unspecified; uses the
		user-set one
	*/
	test: function(startId) {
		var url = '#stories/' + this.model.id + '/test';

		if (startId) {
			url += '/' + startId;
		}

		/*
		Verify that the starting point exists. If no startId was passed, we
		default back to the one set in the model.
		*/

		var startOk = false;

		if (! startId) {
			startOk = (data.passage(this.model.get('startPassage')) !== undefined);
		}
		else {
			startOk = (data.passage(startId) !== undefined);
		}

		if (! startOk) {
			notify(
				locale.say(
					'This story does not have a starting point. ' +
					'Use the <i class="fa fa-rocket"></i> icon on a passage to set this.'
				),
				'danger'
			);
			return;
		}

		// Try re-using the same window.

		var testWindow = window.open('', 'twinestory_test_' + this.model.id);

		if (testWindow.location.href == 'about:blank') {
			testWindow.location.href = url;
		}
		else {
			testWindow.location.reload();
			notify(
				locale.say(
					'Refreshed the test version of your story in the ' +
					'previously-opened tab or window.'
			));
		}
	},

	/*
	Opens a new tab with the proofing copy of this story. This
	will re-use the same tab for a particular story.

	@method proof
	*/
	proof: function() {
		window.open(
			'#stories/' + this.model.id + '/proof',
			'twinestory_proof_' + this.model.id
		);
	},

	/*
	Publishes the story to a file.

	@method publish
	*/
	publish: function() {
		var storyFormat = data.storyFormatForStory(this.model);

		storyFormat.publish(this.model, {}, function(err, source) {
			file.save(source, this.model.get('name') + '.html');
		}.bind(this));
	},

	/*
	This resizes the .passages div to either:
	- the size of the browser window
	- the minimum amount of space needed to enclose all existing passages

	... whichever is bigger, plus 75% of the browser window's width and height, so
	that there's always room for the story to expand.

	This then resizes the view's `<canvas>` element to match the size of the
	`.passages` div, so that lines can be drawn between passage DOM elements
	properly.

	@method resize
	*/
	resize: function() {
		var winWidth = $(window).width();
		var winHeight = $(window).height();
		var zoom = this.model.get('zoom');
		var width = winWidth;
		var height = winHeight;

		if (this.collection.length > 0) {
			var rightPassage, bottomPassage;
			var maxLeft = -Infinity;
			var maxTop = -Infinity;

			this.collection.each(function(p) {
				var left = p.get('left');
				var top = p.get('top');

				if (p.get('left') > maxLeft) {
					maxLeft = left;
					rightPassage = p;
				}

				if (p.get('top') > maxTop) {
					maxTop = top;
					bottomPassage = p;
				}
			});

			var passagesWidth = zoom * (rightPassage.get('left') + Passage.width);
			var passagesHeight = zoom * (bottomPassage.get('top') + Passage.height);

			width = Math.max(passagesWidth, winWidth);
			height = Math.max(passagesHeight, winHeight);
		}
		else {
			width = winWidth;
			height = winHeight;
		}

		width += winWidth * 0.5;
		height += winHeight * 0.5;

		this.$('.passages').css({
			width: width,
			height: height
		});

		this.$('canvas').attr({
			width: width,
			height: height
		});
	},

	/*
	Nudges a passage so that it does not overlap any other passage in the view,
	and so that it snaps to the grid if that's set in the model. This does
	*not* save changes to the passage model.

	@method positionPassage
	@param {Passage} passage Passage to nudge.
	@param {Function} [filter] If passed, any passage this function returns false
		for will be ignored when checking for overlaps.
	*/
	positionPassage: function(passage, filter) {
		// Displace the passage by any others.

		this.collection.each(function(p) {
			if (filter && ! filter(p)) {
				return;
			}

			if (p.id != passage.id && p.intersects(passage)) {
				p.displace(passage);
			}
		});

		/*
		Snap it to the grid if we have that set. We do so in the way that will
		move it the least from its current position.
		*/

		if (this.model.get('snapToGrid')) {
			var xMove, yMove;
			var hGrid = Passage.width / 2;
			var vGrid = Passage.height / 2;

			/*
			Calculate the distance it would need to move to the left; if it is
			more than half the grid spacing, we know moving it rightward will
			be smaller.
			*/

			var leftMove = passage.get('left') % hGrid;

			if (leftMove < hGrid / 2) {
				xMove = -leftMove;
			}
			else {
				xMove = hGrid - leftMove;
			}

			/*
			Same as above, but along the Y axis.
			*/

			var upMove = passage.get('top') % vGrid;

			if (upMove < vGrid / 2) {
				yMove = -upMove;
			}
			else {
				yMove = vGrid - upMove;
			}

			// Set what we came up with in the model.

			passage.set({
				left: passage.get('left') + xMove,
				top: passage.get('top') + yMove
			});
		}
	},

	/*
	Syncs the CSS class associated with the view with the model.

	@method syncZoom
	*/
	syncZoom: function() {
		var zoom = this.model.get('zoom');

		for (var desc in this.ZOOM_MAPPINGS) {
			if (this.ZOOM_MAPPINGS[desc] == zoom) {
				this.$('#storyEditView')
					.removeClass('zoomSmall zoomMedium zoomBig')
					.addClass(desc);
				break;
			}
		}

		this.resize();
	},

	/*
	Syncs the window title with the model's name.

	@method syncName
	*/
	syncName: function() {
		// Those Unicode escaped characters are curly quotes.

		document.title = locale.say(
			'Editing \u201c%s\u201d',
			this.model.get('name')
		);
	},

	events: {
		'drag .passage': function(e) {
			// Draw links between passages as they are dragged around.
			// FIXME: should be moved into the link manager module

			this.linkManager.cachePassage(
				this.collection.get($(e.target).closest('.passage').attr('data-id'))
			);
			this.linkManager.drawLinks();
		},

		'mousedown': function(e) {
			/*
			The last element that was the target of a mousedown event.
			This is used by child views to see if they should pay attention to a
			mouseup event, for example.

			@property {Object} lastMousedown
			*/
			this.lastMousedown = $(e.target);
		},

		'mousewheel': function (e) {
			/*
			Change the zoom level if the user rolls the mouse wheel and has the
			Control or Alt key held down.
			*/

			if (event.altKey && ! event.ctrlKey) {
				// Consider only the veritcal scroll.
				var delta = event.originalEvent.wheelDeltaY;

				if (delta > 0) {
					this.decreaseZoom();
				}
				else {
					this.increaseZoom();
				}
			}
		}
	},

	/*
	Increases the zoom level of the view by one increment. If we are already as
	zoomed in as it gets, this does nothing.
	
	@method increaseZoom
	*/

	increaseZoom: function() {
		var zoomIndex = this.zoomLevels.indexOf(this.get('zoom'));

		zoomIndex++;
		if (zoomIndex === this.zoomLevels.length) {
			zoomIndex = 0;
		}

		this.save('zoom', this.zoomLevels[zoomIndex]);
	},

	/*
	Decreases the zoom level of the view by one increment. If we are already as
	zoomed out as it gets, this does nothing.
	
	@method decreaseZoom
	*/

	decreaseZoom: function() {
		var zoomIndex = this.zoomLevels.indexOf(this.get('zoom'));

		zoomIndex--;
		if (zoomIndex === -1) {
			zoomIndex = this.zoomLevels.length - 1;
		}

		this.save('zoom', this.zoomLevels[zoomIndex]);
	},

	collectionEvents: {
		'change:top change:left': 'resize',
		'change:name': function(p) {
			// Update passages linking to this one to preserve links.

			_.invoke(
				this.collection.models,
				'replaceLink',
				p.previous('name'),
				p.get('name')
			);
		},
		'add': function(p) {
			// Set as starting passage if we only have one.

			if (this.collection.length == 1) {
				this.model.save({startPassage: p.id});
			}
		},
		'error': function(model, resp) {
			// L10n: %s is the error message.
			notify(
				locale.say('A problem occurred while saving your changes (%s).', resp),
				'danger'
			);
		}
	},

	modelEvents: {
		'change:zoom': this.syncZoom,
		'change:name'' this.syncName,
		'error', function(model, resp) {
			// L10n: %s is the error message.
			notify(
				locale.say('A problem occurred while saving your changes (%s).', resp),
				'danger'
			);
	}
});
