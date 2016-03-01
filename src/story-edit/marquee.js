/**
 Manages drawing a marquee selection if the user drags in an unoccupied area
 of the story map, and selecting/deselecting

 @class StoryEditView.Marquee
 @extends Backbone.View
**/

'use strict';
var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');

module.exports = Backbone.View.extend({
	initialize(options) {
		this.parent = options.parent;
		this.$marquee = this.$('.marquee');
		this.followDragBound = this.followDrag.bind(this);
		this.endDragBound = this.endDrag.bind(this);
	},

	startDrag(e) {
		// bail out if the target is a .passage element

		if ($(e.target).closest('.passage').length > 0) {
			return;
		}

		this.startX = e.pageX;
		this.startY = e.pageY;

		this.offset = this.$el.offset();
		this.inclusive = e.shiftKey || e.ctrlKey;

		// cache all passage positions so we can
		// quickly figure out intersections

		// dimensions of a passage

		var width = this.$('.passage:first .frame').outerWidth();
		var height = this.$('.passage:first .frame').outerHeight();

		this.cache = [];

		this.parent.children.each(function(view) {
			var offset = view.$('.frame').offset();

			this.cache.push({
				view,
				left: offset.left,
				top: offset.top,
				right: offset.left + width,
				bottom: offset.top + height,
				originallySelected: view.selected
			});

			if (!this.inclusive) {
				view.deselect();
			}
		}, this);

		$('#storyEditView').addClass('marqueeing');

		$('body').on({
			mousemove: this.followDragBound,
			mouseup: this.endDragBound
		});
	},

	followDrag(e) {
		// marquee appearance

		var left, top, width, height;

		if (e.pageX > this.startX) {
			left = this.startX;
			width = e.pageX - this.startX;
		}
		else {
			left = e.pageX;
			width = this.startX - e.pageX;
		}

		if (e.pageY > this.startY) {
			top = this.startY;
			height = e.pageY - this.startY;
		}
		else {
			top = e.pageY;
			height = this.startY - e.pageY;
		}

		this.$marquee.css({
			display: 'block',
			left: left - this.offset.left,
			top: top - this.offset.top,
			width,
			height
		});

		// select passages

		_.each(this.cache, function(item) {
			if (this.inclusive && item.originallySelected) {
				return;
			}

			// intersection of two rectangles

			if (item.left < left + width && item.right > left &&
				item.top < top + height && item.bottom > top) {
				item.view.select();
			}
			else {
				item.view.deselect();
			}
		}, this);
	},

	endDrag() {
		this.$marquee.css('display', 'none');
		$('#storyEditView').removeClass('marqueeing');
		$('body').off({
			mousemove: this.followDragBound,
			mouseup: this.endDragBound
		});
	},

	events: {
		'mousedown': 'startDrag'
	}
});
